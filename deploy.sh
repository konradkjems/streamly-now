#!/bin/bash

# Vue Movies Production Deployment Script
# This script handles the complete deployment process with security measures

set -e  # Exit on any error

# Configuration
APP_NAME="vue-movies"
DOCKER_IMAGE="vue-movies:latest"
CONTAINER_NAME="vue-movies-app"
NGINX_CONTAINER="vue-movies-nginx"
BACKUP_DIR="/backup/vue-movies"
LOG_FILE="/var/log/vue-movies/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required files exist
    if [ ! -f "Dockerfile" ]; then
        error "Dockerfile not found"
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml not found"
    fi
    
    if [ ! -f "nginx.conf" ]; then
        error "nginx.conf not found"
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    # Create backup directory
    mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    
    # Backup current containers
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log "Backing up current container..."
        docker commit $CONTAINER_NAME $APP_NAME:backup-$(date +%Y%m%d_%H%M%S)
    fi
    
    # Backup configuration files
    cp -r . $BACKUP_PATH/
    
    log "Backup created at $BACKUP_PATH"
}

# Build application
build_app() {
    log "Building application..."
    
    # Install dependencies
    npm ci --only=production
    
    # Build the application
    npm run build
    
    # Build Docker image
    docker build -t $DOCKER_IMAGE .
    
    log "Application built successfully"
}

# Security checks
security_checks() {
    log "Running security checks..."
    
    # Check for security vulnerabilities
    if npm audit --audit-level=high | grep -q "found"; then
        warning "High severity vulnerabilities found. Consider updating dependencies."
    fi
    
    # Check SSL certificates
    if [ -f "ssl/certificate.crt" ] && [ -f "ssl/private.key" ]; then
        log "SSL certificates found"
    else
        warning "SSL certificates not found. HTTPS will not work."
    fi
    
    # Check environment variables
    if [ ! -f ".env.production" ]; then
        warning "Production environment file not found"
    fi
    
    log "Security checks completed"
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    
    # Stop existing containers
    docker-compose down
    
    # Start new containers
    docker-compose up -d
    
    # Wait for containers to be ready
    sleep 10
    
    # Check if containers are running
    if ! docker ps | grep -q $CONTAINER_NAME; then
        error "Application container failed to start"
    fi
    
    if ! docker ps | grep -q $NGINX_CONTAINER; then
        error "Nginx container failed to start"
    fi
    
    log "Application deployed successfully"
}

# Health check
health_check() {
    log "Running health checks..."
    
    # Check if application is responding
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log "Application health check passed"
    else
        error "Application health check failed"
    fi
    
    # Check if Nginx is responding
    if curl -f http://localhost:80/ > /dev/null 2>&1; then
        log "Nginx health check passed"
    else
        error "Nginx health check failed"
    fi
    
    log "All health checks passed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    cd $BACKUP_DIR
    ls -t | tail -n +6 | xargs -r rm -rf
    cd -
    
    log "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose down
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    # Restore from backup
    cp -r $BACKUP_DIR/$LATEST_BACKUP/* .
    
    # Start containers
    docker-compose up -d
    
    log "Rollback completed"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            create_backup
            build_app
            security_checks
            deploy_app
            health_check
            cleanup
            log "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        "backup")
            create_backup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

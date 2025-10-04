<template>
  <div :class="$style.skeletonCard">
    <div :class="$style.skeletonImage"></div>
    <div :class="$style.skeletonText">
      <div :class="$style.skeletonTitle"></div>
      <div :class="$style.skeletonRating"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonCard',
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeletonCard {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);

  @media (min-width: $breakpoint-xsmall) {
    margin-bottom: 2rem;
  }
}

.skeletonImage {
  position: relative;
  height: 0;
  padding-top: 150.27%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 8px;
}

.skeletonText {
  padding: 1rem 0;

  @media (max-width: $breakpoint-xsmall - 1) {
    display: none;
  }
}

.skeletonTitle {
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 0.8rem;
}

.skeletonRating {
  height: 12px;
  width: 60%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  animation-delay: 0.2s;
  border-radius: 4px;
}
</style>


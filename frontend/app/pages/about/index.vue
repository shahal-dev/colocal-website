<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'About Us', href: '/about' },
      ]"
      page-title="About Us"
    />
    <AboutIntroSection />
    <QuotesSection />
    <MissionSection />
    <UniversitiesTeaser />
  </div>
</template>

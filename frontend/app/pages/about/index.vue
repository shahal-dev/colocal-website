<script setup lang="ts">
useHead({
  title: 'About Us — LUCCC',
});
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <!-- breadcrumb stretched full width on small screens -->
    <BreadCrumb
:breadcrumb-items="[
      { text: 'Home', href: '/' },
      { text: 'About LUCCC', href: '/about' },
    ]" page-title="Least Developed Countries Universities Consortium on Climate Change" />

    <!-- Main Content Container -->
    <div class="w-full max-w-4xl mx-auto px-4 py-12 mb-10">
      <!-- Intro Section -->
      <section class="mb-12">
        <div class="flex flex-col gap-6 items-center mb-8">
          <img
src="http://www.icccad.net/wp-content/uploads/2017/03/Selected-LUCCC-logo-min.png" alt="LUCCC Logo"
            class="h-24 object-contain shrink-0 mb-2">
          <p class="text-gray-700 leading-relaxed text-lg">
            The Least Developed Countries (LDCs) Universities Consortium on Climate Change (LUCCC)
            is a South-South long-term capacity-building platform comprised of 17 universities as
            founding members from the LDCs at the moment. Under this network of universities,
            faculty members and students share experiences and knowledge on climate change to build
            capacity through education, training, research and communication. LUCCC as an LDC-wide
            initiative has been endorsed by the LDC Ministerial in Addis Ababa in October 2018.
          </p>
        </div>

        <!-- Video -->
        <div class="relative w-full overflow-hidden rounded-xl shadow-md bg-gray-100" style="padding-top: 56.25%">
          <iframe
title="Launch of the Least Developed Countries Universities Consortium on Climate Change (LUCCC)"
            class="absolute top-0 left-0 w-full h-full border-0"
            src="https://www.youtube.com/embed/2Q4xLn54oAg?feature=oembed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen />
        </div>
        <div class="text-center mt-2 text-gray-700 italic mb-12 text-lg">
          The late Dr. Saleemul Huq, founding director, ICCCAD, on LUCCC
        </div>
      </section>

      <!-- Background -->
      <section class="mb-12">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-green-700">
          Background
        </h3>
        <div class="space-y-4 text-gray-700 leading-relaxed text-lg">
          <p>
            At COP21 in Paris the parties to the conference witnessed a discussion, perhaps for the
            first time, on the issue of capacity building that led them to ponder over UNFCCC’s role
            in this regard. After considerable discussion, Article 11 of the Paris Agreement
            reaffirmed that capacity building and climate education is essential to effectively
            implement climate action. Hence the emphasis has now shifted from short term capacity
            building to long term capacity building. It was further mandated upon the formation of
            the Paris Committee for Capacity Building (PCCB) at COP22 in Marrakech, Morocco in 2016.
          </p>
          <p>
            During COP22 in Marrakech the Independent University, Bangladesh (IUB) and the
            University of Cadi Ayyad in Morocco held a side event to discuss the role of
            Universities in implementing Article 11 of the Paris Committee. Also the Research and
            Independent NGOs (RINGOs) group, along with IUB and the UNFCCC Secretariat, held another
            side event on the same topic. Following an overwhelming support from students and
            faculties of the universities from the Least Developed Countries (LDCs), ICCCAD and
            MUCCRI took the initiative to set up the LDC Universities Consortium on Climate Change
            (LUCCC), a South-South Consortium of 17 Universities from the region to enhance
            knowledge on climate change through climate capacity building, with a focus on
            adaptation measures, such as education and research.
          </p>
        </div>
      </section>

      <!-- Objectives -->
      <section class="mb-12">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-green-700">
          Objectives
        </h3>
        <ul class="list-disc pl-6 space-y-4 text-gray-700 leading-relaxed marker:text-green-600 text-lg">
          <li>
            To foster a South-South collaborative network for promoting education and skills,
            research capacity and developing multi-dimensional expertise in climate change.
          </li>
          <li>
            To enhance the capacity of LDC universities through joint research programmes and
            implement teaching and demand-driven training programs in various climate change issues.
          </li>
          <li>
            To develop capacity and work with the most vulnerable countries and communities to
            foster two-way collaborative learning and capacity-building – blending action &amp;
            scientific research.
          </li>
          <li>
            To enable LDC universities &amp; affiliated research/training institutes to serve as
            repositories of knowledge and generators-suppliers of capacity.
          </li>
          <li>
            To provide policy support to governments in handling climate change impacts, both
            nationally &amp; internationally.
          </li>
        </ul>
      </section>

      <!-- LUCCC Partners Map -->
      <section class="mb-16">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-green-700">
          Map of LUCCC Partners
        </h3>
        <LucccPartnerMap />
      </section>

      <!-- Partners List -->
      <section class="mb-12">
        <h3 class="text-[22px] md:text-[26px] font-display font-semibold mb-6 text-green-700">
          LUCCC Partners
        </h3>
        <p class="text-gray-700 text-lg leading-relaxed mb-10 max-w-3xl">
          The Consortium is managed at the moment by the International Centre for Climate Change and
          Development (ICCCAD) at Independent University, Bangladesh (IUB) in Dhaka. A Governing
          Board as well as an Executive Committee will be formed soon to collectively run LUCCC.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <!-- West Africa -->
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4">
              West Africa
            </h4>
            <ul class="space-y-4">
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Benin</span>
                <span class="text-gray-600 text-sm">University of Parakou</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Burkina Faso</span>
                <span class="text-gray-600 text-sm">University Joseph Ki-Zerbo</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">The Gambia</span>
                <span class="text-gray-600 text-sm">University of The Gambia</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Liberia</span>
                <span class="text-gray-600 text-sm">University of Liberia</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Senegal</span>
                <span class="text-gray-600 text-sm">University of Cheikh Anta Diop</span>
              </li>
            </ul>
          </div>

          <!-- Asia -->
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4">
              Asia
            </h4>
            <ul class="space-y-4">
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Afghanistan</span>
                <span class="text-gray-600 text-sm">Faculty of Environment, Kabul University</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Bangladesh</span>
                <span class="text-gray-600 text-sm">International Centre for Climate Change and Development (ICCCAD) at
                  IUB</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Bhutan</span>
                <span class="text-gray-600 text-sm">College of Natural Resources, Royal University of Bhutan</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Nepal</span>
                <span class="text-gray-600 text-sm">School of Environmental Science and Management (SchEMS), Pokhara
                  University,
                  Nepal</span>
              </li>
            </ul>
          </div>

          <!-- East Africa -->
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4">
              East Africa
            </h4>
            <ul class="space-y-4">
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Ethiopia</span>
                <span class="text-gray-600 text-sm">Climate Science Centre, Addis Ababa University</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Rwanda</span>
                <span class="text-gray-600 text-sm">Center of Excellence in Biodiversity and Natural Resource
                  Management, University
                  of Rwanda</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Sudan</span>
                <span class="text-gray-600 text-sm">Institute of Environmental Studies, University of Khartoum</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Tanzania</span>
                <span class="text-gray-600 text-sm">University of Dar-es-Salaam</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Uganda</span>
                <span class="text-gray-600 text-sm">Makerere University Centre for Climate Change Research and
                  Innovation (MUCCRI),
                  Makerere University</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Malawi</span>
                <span class="text-gray-600 text-sm">Lilongwe University of Agriculture and Natural Resources
                  (LUANAR)</span>
              </li>
            </ul>
          </div>

          <!-- Central & Southern Africa -->
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4">
              Central &amp; Southern Africa
            </h4>
            <ul class="space-y-4">
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Democratic Republic of Congo</span>
                <span class="text-gray-600 text-sm">Université Officielle de Bukavu</span>
              </li>
              <li class="flex flex-col">
                <span class="font-semibold text-gray-800">Mozambique</span>
                <span class="text-gray-600 text-sm">Eduardo Mondlane University</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Publications & Contacts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 bg-green-50 rounded-2xl p-8 border border-green-100/50">
        <div>
          <h3 class="text-2xl font-display font-semibold text-green-800 mb-6">Publications</h3>
          <ul class="list-disc pl-5 space-y-3 text-green-800/80 marker:text-green-600">
            <li>
              <a
href="http://www.icccad.net/wp-content/uploads/2018/11/Final_LUCCC_Bellagio-Workshop-2018_-Report.pdf"
                target="_blank" class="hover:text-green-600 hover:underline transition-colors">Report on the Planning
                Meeting of the LUCCC Partners</a>
            </li>
            <li>
              <a
href="http://www.icccad.net/wp-content/uploads/2016/08/Capacity-Building-Policy-Brief-July-4.pdf"
                target="_blank" class="hover:text-green-600 hover:underline transition-colors">The Role of Universities
                in Capacity Building under the Paris Agreement</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-2xl font-display font-semibold text-green-800 mb-6">
            Contact Information
          </h3>
          <div class="space-y-5 text-green-800/80">
            <div>
              <p class="font-bold text-green-900">Prof. Mizan R. Khan</p>
              <p class="text-sm">Programme Director (LUCCC)</p>
              <p class="text-sm mt-1">
                Email:
                <a
href="mailto:mizan.khan@icccad.org"
                  class="hover:text-green-600 hover:underline transition-colors">mizan.khan@icccad.org</a>
              </p>
            </div>
            <div>
              <p class="font-bold text-green-900">Md Fahad Hossain</p>
              <p class="text-sm mt-1">
                Email:
                <a
href="mailto:fahad.hossain@icccad.org"
                  class="hover:text-green-600 hover:underline transition-colors">fahad.hossain@icccad.org</a>
              </p>
            </div>
            <div>
              <p class="font-bold text-green-900">Fahmid Mohtasin</p>
              <p class="text-sm mt-1">
                Email:
                <a
href="mailto:fahmid.mohtasin@icccad.org"
                  class="hover:text-green-600 hover:underline transition-colors">fahmid.mohtasin@icccad.org</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

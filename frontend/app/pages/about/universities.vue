<script setup>
useHead({
  title: 'List of Universities — LUCCC',
});

const universities = [
  { id: 1, country: 'Afghanistan', institution: 'Faculty of Environment, Kabul University' },
  { id: 2, country: 'Bangladesh', institution: 'Independent University, Bangladesh (IUB)' },
  { id: 3, country: 'Benin', institution: 'University of Parakou' },
  {
    id: 4,
    country: 'Bhutan',
    institution: 'College of Natural Resources, Royal University of Bhutan',
  },
  { id: 5, country: 'Burkina Faso', institution: 'University Joseph Ki-Zerbo' },
  {
    id: 6,
    country: 'Democratic Republic of Congo',
    institution: 'Université Officielle de Bukavu',
  },
  { id: 7, country: 'Ethiopia', institution: 'Climate Science Centre, Addis Ababa University' },
  { id: 8, country: 'The Gambia', institution: 'University of The Gambia' },
  { id: 9, country: 'Liberia', institution: 'University of Liberia' },
  {
    id: 10,
    country: 'Malawi',
    institution: 'Lilongwe University of Agriculture and Natural Resources (LUANAR)',
  },
  { id: 11, country: 'Mozambique', institution: 'Eduardo Mondlane University' },
  {
    id: 12,
    country: 'Nepal',
    institution: 'School of Environmental Science and Management (SchEMS), Pokhara',
  },
  {
    id: 13,
    country: 'Rwanda',
    institution:
      'Center of Excellence in Biodiversity and Natural Resource Management, University of Rwanda',
  },
  { id: 14, country: 'Senegal', institution: 'University of Cheikh Anta Diop' },
  {
    id: 15,
    country: 'Sudan',
    institution: 'Institute of Environmental Studies, University of Khartoum',
  },
  { id: 16, country: 'Tanzania', institution: 'University of Dar-es-Salaam' },
  {
    id: 17,
    country: 'Uganda',
    institution:
      'Makerere University Centre for Climate Change Research and Innovation (MUCCRI), Makerere University',
  },
];
</script>

<template>
  <div class="flex flex-col items-center w-full justify-center">
    <BreadCrumb
      :breadcrumb-items="[
        { text: 'Home', href: '/' },
        { text: 'About Us', href: '/about' },
        { text: 'Universities', href: '/about/universities' },
      ]"
      page-title="List of Universities"
    />

    <section class="w-full max-w-4xl mx-auto px-4 md:px-0 py-10">
      <h1 class="text-[28px] md:text-[32px] font-display font-medium mb-3">List of Universities</h1>
      <p class="text-gray-700 text-sm md:text-base mb-6 text-justify">
        The Consortium is managed at the moment by the International Centre for Climate Change and
        Development (ICCCAD) at Independent University, Bangladesh (IUB) in Dhaka. A Governing Board
        as well as an Executive Committee will be formed soon to collectively run LUCCC.
      </p>

      <div class="overflow-hidden rounded border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead class="bg-blue-gray-50 text-gray-700">
            <tr>
              <th class="px-4 py-3 w-12">#</th>
              <th class="px-4 py-3">Country</th>
              <th class="px-4 py-3">Institution</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="u in universities" :key="u.id" class="bg-white">
              <td class="px-4 py-3 text-gray-600">{{ u.id }}</td>
              <td class="px-4 py-3 text-gray-800">{{ u.country }}</td>
              <td class="px-4 py-3 text-gray-800">{{ u.institution }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/* For now, this is a static layout. You can wire up real form submission later. */
const onSubmit = (e: Event) => {
  e.preventDefault();
  console.info('Submit contact form');
};

defineProps<{ phone?: string; email?: string; address?: string }>();
</script>

<template>
  <section class="h-[690px] w-full max-w-6xl mx-auto py-10 px-20">
    <div
      class="bg-blue-gray-100 grid grid-cols-1 md:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-sm"
    >
      <!-- Left: Contact details -->
      <div class="p-8 md:p-10">
        <h3 class="text-2xl font-display font-medium mb-2">Get in Touch</h3>
        <p class="font-body text-sm text-gray-600 max-w-prose mb-6">
          We'd love to hear from you! Reach out to collaborate, ask questions, or learn more about
          LUCCC’s initiatives.
        </p>

        <ul class="space-y-4">
          <li class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-gray-200 inline-flex items-center justify-center">
              <svg
                class="w-4 h-4 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h4.09a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L9 9a16 16 0 0 0 6 6l.81-1.18a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z"
                  stroke-width="2"
                />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold">Phone</p>
              <p class="text-sm text-gray-600">{{ phone || '+8801813444112' }}</p>
            </div>
          </li>

          <li class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-gray-200 inline-flex items-center justify-center">
              <svg
                class="w-4 h-4 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M4 4h16v16H4z" stroke-width="2" />
                <path d="m22 6-10 7L2 6" stroke-width="2" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold">Email</p>
              <p class="text-sm text-gray-600">{{ email || 'hello@luccc.org' }}</p>
            </div>
          </li>

          <li class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-gray-200 inline-flex items-center justify-center">
              <svg
                class="w-4 h-4 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  stroke-width="2"
                />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold">Address</p>
              <p class="text-sm text-gray-600">
                {{ address || 'Plot 16 Aftab Uddin Ahmed Rd, Dhaka 1229' }}
              </p>
            </div>
          </li>
        </ul>

        <div class="mt-8">
          <p class="text-sm font-semibold mb-3">Follow our social media</p>
          <div class="flex items-center gap-3">
            <button
              class="w-7 h-7 p-2 rounded bg-green-200 text-green-700 inline-flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1200"
                height="1227"
                fill="none"
                viewBox="0 0 1200 1227"
              >
                <path
                  fill="#000"
                  d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                />
              </svg>
            </button>
            <button
              class="w-7 h-7 p-1 rounded bg-green-200 text-green-700 inline-flex items-center justify-center"
            >
              <svg
                viewBox="0 0 256 180"
                width="256"
                height="180"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
              >
                <path
                  d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z"
                  fill="red"
                />
                <path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="p-8 md:p-10 bg-white/60">
        <h3 class="text-2xl font-display font-medium mb-5">Send us a message</h3>
        <form class="space-y-4" @submit="onSubmit">
          <input
            type="text"
            placeholder="Name*"
            class="w-full p-3 border border-gray-200 bg-white rounded"
            required
          />
          <input
            type="email"
            placeholder="Email*"
            class="w-full p-3 border border-gray-200 bg-white rounded"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            class="w-full p-3 border border-gray-200 bg-white rounded"
          />
          <textarea
            placeholder="Message"
            rows="4"
            class="w-full p-3 border border-gray-200 bg-white rounded"
          />
          <button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-sm font-semibold"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

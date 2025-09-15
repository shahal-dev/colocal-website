<template>
    <nav class="flex items-center justify-between px-60 py-4 bg-white">
        <div>
            <a href="/">
                <img src="../assets/logos/luccc-logo.png" alt="Logo" class="h-12">
            </a>
        </div>

        <div class="flex items-center space-x-12 font-sans font-semibold">
            <a href="/" class="text-gray-700 hover:text-gray-900">Home</a>
            
            <div class="relative group">
                <button class="text-gray-700 hover:text-gray-900 flex items-center">
                    About Us
                    <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div class="py-1">
                        <a href="/about" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Our Story</a>
                        <a href="/team" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Team</a>
                        <a href="/mission" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mission</a>
                    </div>
                </div>
            </div>
            
            <a href="/resource-hub" class="text-gray-700 hover:text-gray-900">Resource Hub</a>
            <a href="/projects-programmes" class="text-gray-700 hover:text-gray-900">Projects & Programmes</a>
            <a href="/education-training" class="text-gray-700 hover:text-gray-900">Education & Training</a>
            <a href="/news-events" class="text-gray-700 hover:text-gray-900">News & Events</a>
        </div>
    </nav>
</template>
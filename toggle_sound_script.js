document.addEventListener("DOMContentLoaded", () => {
    //Sound 
    const toggleTheme = document.getElementById("toggle-sound");
    if (window.Howler) {
        window.Howler.mute(true);
    }
    const enableAudio = () => {
        if (window.Howler) {
            window.Howler.mute(false);
            console.log("Site Unmuted");
        }
        toggleTheme.removeEventListener('click', enableAudio);
    };
    toggleTheme.addEventListener('click', enableAudio);

    const hoverElements = document.querySelectorAll('[data-sound="hover"]');
    const clickElements = document.querySelectorAll('[data-sound-2="click"]');
    const switchElements = document.querySelectorAll('[data-sound-3="switch"]');
    const audioFiles = [
        { name: 'hover', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874ff9f50d638a6cd33_7a01168271dbc7b91c0ee8c4ba7bdd70_btn_hover.mp3', volume: 3.0 },
        { name: 'click', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6944045763acbfc93eba703d_menu_item_hover.mp3', volume: 0.5, rate: 2.0 }, // Ensure this path is correct
        { name: 'switch', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874813e23b235b00634_btn_switch.mp3' }
    ];

    const globalDefaults = {
        autoplay: false,
        volume: 2.0,
        preload: true
    };

    const library = {};
    audioFiles.forEach(file => {
        library[file.name] = new Howl({
            ...globalDefaults,
            ...file
        });
    });

    hoverElements.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            library.hover.stop().play();
        });
    });

    clickElements.forEach(btn => {
        btn.addEventListener('click', () => {
            library.click.stop().play();
        });
    });

    switchElements.forEach(el => {
        el.addEventListener('click', () => {
            library.switch.stop().play();
        });
    });
    function playWithDelay(soundName, ms) {
        setTimeout(() => {
            if (library[soundName]) {
                library[soundName].stop().play();
            }
        }, ms);
    }

});
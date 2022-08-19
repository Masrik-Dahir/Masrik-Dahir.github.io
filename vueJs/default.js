var app = Vue.createApp({
    data: function(){
        return {
            greeting: 'Hello Vue 3!',
            isVisible: false,
            isVisible2: true,
            button_to_activate_box: false,
            button_text: "show",
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            rand: '10px',
            color: 'red',
            middle: (window.innerWidth - 960)/2,
            middle2: (window.innerWidth - 10)/2,
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods:{
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show"){
                this.button_text = "hide";
            }
            else{
                this.button_text = "show";
            }
        },
        greet(greeting){
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 960)/2;
            this.middle2 = (window.innerWidth - 50)/2;
        },
        modelStyle: function(slide) {

            if (slide === 'middle'){
                return {
                    'left': `${this.middle}px`
                };
            }
            else if (slide === 'middle2'){
                return {
                    'left': `${this.middle2}px`
                };
            }

        }

    }
})
app.mount('#app');

var app2 = Vue.createApp({
    data: function(){
        return {
            greeting: 'Hello Vue 3!',
            isVisible: false,
            isVisible2: true,
            button_to_activate_box: false,
            button_text: "show",
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            rand: '10px',
            color: 'red',
            middle: (window.innerWidth - 960)/2,
            middle2: (window.innerWidth - 10)/2,
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods:{
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show"){
                this.button_text = "hide";
            }
            else{
                this.button_text = "show";
            }
        },
        greet(greeting){
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 960)/2;
            this.middle2 = (window.innerWidth - 50)/2;
        },
        modelStyle: function(slide) {

            if (slide === 'middle'){
                return {
                    'left': `${this.middle}px`
                };
            }
            else if (slide === 'middle2'){
                return {
                    'left': `${this.middle2}px`
                };
            }

        }

    }
})
app2.mount('#app2');
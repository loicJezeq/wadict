"use strict";

const App = {
    data() {
        return {
            "entrySources": {},
            "loading": false,
            "query": ""
        };
    },
    computed: {
        sortedEntrySources: function() {
            function compare(a, b) {
                if (a[1].lang < b[1].lang) return -1;
                if (a[1].lang > b[1].lang) return 1;
                return 0;
            }
            return Object.entries(this.entrySources).sort(compare);
        }
    },
    methods: {
        searchQuery() {
            // First get the word from input.
            reel.input_to_word(this.query)(word=>{
                this.entrySources = {};
                this.loading = true;
                reel.search_all(word)(ret=>{
                    let [name, s] = ret
                    this.entrySources[name] = s;
                }, ()=>{
                    this.loading = false;
                });
            });
        }
    },
    template: `
    <div>
        <div class="header">
            <input type="text" v-model="query" @keyup.enter="searchQuery" :disabled="loading" />
        </div>
        <div class="section">
            <p>Images:
                <a :href="'https://www.google.com/search?q='+query+'&tbm=isch'">google</a>,
                <a :href="'https://www.google.com/search?q='+query+'%20%E3%82%A4%E3%83%A9%E3%82%B9%E3%83%88&tbm=isch'">illustrations</a>
            </p>
            <p>Differences:
                <a :href="'https://www.google.com/search?q=difference+between+'+query+'+and'">google</a>
            </p>
            <entry-sources :entry="sortedEntrySources"></entry-sources>
            <div v-if="loading">
                LOADING...
            </div>
        </div>
    </div>`
};

const EntrySources = {
    props: ["entry"],
    template: `
    <div v-if="entry">
        <template v-for="[source, data] in entry">
            <fieldset v-if="source == 'forvo'">
                <legend>Forvo audio</legend>
                <div v-for="[jp, audio] in data">
                    {{jp}} <audio-url :url="audio"></audio-url>
                </div>
            </fieldset>
            <fieldset v-else-if="source == 'dictgoo'">
                <legend>Goo jisho</legend>
                <div v-for="meaning in data.meanings">{{ meaning }}</div>
                <div>Synonyms: {{ data.synonyms }}</div>
            </fieldset>
            <fieldset v-else-if="source == 'wwwJdic'">
                <legend>WWW JDic</legend>
                <ol class="meaning">
                    <li v-for="meaning in data.meaning">
                        {{meaning}}
                    </li>
                </ol>
                <audio-url v-if="data.audio" :url="data.audio"></audio-url>
            </fieldset>
            <fieldset v-else-if="source == 'dictJaponais'">
                <legend>Dictionnaire Japonais</legend>
                <div>{{data.fr}}</div>
                <audio-url v-if="data.audio" :url="data.audio"></audio-url>
            </fieldset>
            <fieldset v-else-if="source == 'wwwJdicFr'">
                <legend>WWW JDic FR</legend>
                <ol class="meaning">
                    <li v-for="meaning in data.meaning">
                        {{meaning}}
                    </li>
                </ol>
            </fieldset>
            <fieldset v-else-if="source == 'jibiki'">
                <legend>Jibiki <span v-if="data.source">[{{ data.source }}]</span></legend>
                {{ data.jp }} [{{ data.kana }}]
                <ol class="meaning">
                    <li v-for="meaning in data.meaning">
                        {{meaning}}
                    </li>
                </ol>
                <ul class="linked">
                    <li v-for="example in data.examples">
                        <span v-html="example.jp_ruby"></span>
                        <ol class="meaning">
                            <li v-for="meaning in example.meaning">
                                {{meaning}}
                            </li>
                        </ol>
                    </li>
                </ul>
            </fieldset>
        </template>
    </div>
    `
};

const AudioUrl = {
    props: ["url"],
    methods: {
        playAudio() {
            this.$refs.audio.play();
        },
        copyUrl() {
            var temp = document.createElement("input");
            this.$refs.root.appendChild(temp);
            temp.value = this.url;
            temp.select();
            document.execCommand("copy");
            temp.remove();
        }
    },
    template: `
    <span ref="root">
        <audio :src="url" preload="auto" ref="audio"></audio><button @click="playAudio">&#9654</button>
        <button @click="copyUrl">Copy</button>
    </span>`
};

const vm = Vue.createApp(App)
    .component("entry-sources", EntrySources)
    .component("audio-url", AudioUrl)
    .mount("#app");

window.vm = vm;
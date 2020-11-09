const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    langChange: null,
    capslock: null,
    shift: null,
    space: null,
    enter: null,
    backspace: null,
    leftArrow: null,
    rightArrow: null,
    muse: null,
    voiceInput: null,
    recognition: null,
    textArea: null,
    keys: []
  },

  eventHandlers: {
    oninput: null,
    onclose: null
  },

  properties: {
    value: "",
    cursorPos: 0,
    selectPos: 0,
    lang: "en",
    shift: false,
    capsLock: false,
    muse: false,
    is_chrome: false,
    shiftClicked: false,
    altClicked: false,
    cntrlClicked: false,
    voiceInput: false
  },

  keySceleton: [
    [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, "backspace"],
    [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221], //12
    ["caps", 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222,"enter"], //11
    ["shift", 90, 88, 67, 86, 66, 78, 77, 188, 190, 191, "🎤"], //10
    ["done","ru / en","space", "🔔", "←", "→"]
  ],

  keyLayouts: {
    en: [
      [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
        "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
        "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter",
        "shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "🎤",
        "done","EN","space","🔔", "←", "→"
      ],
      [
        "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "backspace",
        "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}",
        "caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "\"", "enter",
        "shift", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?", "🎤",
        "done","EN","space", "🔔", "←", "→"
      ],
    ],
    ru: [
      [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
        "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
        "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э","enter",
        "shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".", "🎤", 
        "done","RU","space", "🔔", "←", "→"
      ],
      [
        "!", "\"", "№", ";", "%", ":", "?", "*", "(", ")", "backspace",
        "Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х", "Ъ",
        "caps", "Ф", "Ы", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Э","enter",
        "shift", "Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю", ",", "🎤",
        "done","RU","space", "🔔", "←", "→"
      ],
    ]
  },

  init(textArea) {
    this.properties.is_chrome = /chrome/i.test(navigator.userAgent);;
    //Init speech recognition if this is a Chrome like browser
    if (this.properties.is_chrome) {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.elements.recognition = new SpeechRecognition();
      this.elements.recognition.interimResults = false;
      this.elements.recognition.lang = 'en-US';
    }

    // Create main elements
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");

    // Setup main elements
    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());
    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);
    
    //Init text input if it was provided
    if (textArea !== undefined && textArea !== null) {
      this.elements.textArea = textArea;
      //Move assign listener to text area if it is provided for init
      this.elements.textArea.addEventListener("click", () => {
        this.open(this.elements.textArea.value, currentValue => {
          this.elements.textArea.value = currentValue;
          if  (this.properties.cursorPos < this.properties.selectPos) {
            this.elements.textArea.setSelectionRange(this.properties.cursorPos, this.properties.selectPos);
          } else {
            this.elements.textArea.setSelectionRange(this.properties.selectPos, this.properties.cursorPos);
          }
          this.elements.textArea.focus();
        });
      });
      //Turn off handling of keyboard events for the input area
      this.elements.textArea.addEventListener("keydown", (event) => {
        event.preventDefault();
      });
      this.elements.textArea.addEventListener("keypress", (event) => {
        event.preventDefault();
      });
      this.elements.textArea.addEventListener("keyup", (event) => {
        event.preventDefault();
      });
      this.elements.textArea.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      this._wireVirtualKeysWithTextArea();
    }
  },

  _wireVirtualKeysWithTextArea() {

    document.addEventListener("keydown", (event) => {      

      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        this.properties.cntrlClicked = true;
      }

      if (event.code === "AltLeft" || event.code === "AltRight") {
        this.properties.altClicked = true;
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        this.properties.shiftClicked = true;
      }

      if (event.shiftKey && !event.altKey && !event.ctrlKey) {
        this.elements.shift.click();
        this.properties.shiftClicked = true;
        this.elements.shift.style.background = "#f0406c";
        setTimeout(()=> {this.elements.shift.style.background = "#f16f90";}, 200);
      }

      if ((this.properties.cntrlClicked && this.properties.shiftClicked) ||
          (this.properties.altClicked && this.properties.shiftClicked)) {
        this.elements.langChange.click();        
        this.elements.langChange.style.background = "#f0406c";
        setTimeout(()=> {this.elements.langChange.style.background = "#f16f90";}, 200);
      }

      if (event.code === "CapsLock") {
        this.elements.capslock.click();
        this.elements.capslock.style.background = "#f0406c";
      }

      if (event.code === "Space") {
        this.elements.space.style.background = "#f0406c";
        this.elements.space.click();
      }

      if (event.code === "ArrowLeft") {
        this.elements.leftArrow.style.background = "#f0406c";
        this.elements.leftArrow.click();
      }

      if (event.code === "ArrowRight") {
        this.elements.rightArrow.style.background = "#f0406c";
        this.elements.rightArrow.click();
      }

      if (event.code === "Enter" || event.code === "NumpadEnter") {
        this.elements.enter.style.background = "#f0406c";
        this.elements.enter.click();
      }

      if (event.code === "Backspace") {
        this.elements.backspace.style.background = "#f0406c";
        this.elements.backspace.click();
      }

      for (const key of this.elements.keys) {
        if (key.childElementCount === 0 && key.getAttribute("keycode") == event.keyCode) {
            key.style.background = "#f0406c";
            key.click();
        }
      }
  
    });

    document.addEventListener("keyup", (event) => {

      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        this.properties.cntrlClicked = false;
      }

      if (event.code === "AltLeft" || event.code === "AltRight") {
        this.properties.altClicked = false;
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        this.properties.shiftClicked = false;
      }

      if (event.code === "CapsLock") {
        this.elements.capslock.style.background = "#f16f90";
      }

      if (event.code === "Space") {
        this.elements.space.style.background = "#f16f90";
      }

      if (event.code === "Enter" || event.code === "NumpadEnter") {
        this.elements.enter.style.background = "#f16f90";
      }

      if (event.code === "ArrowRight") {
        this.elements.rightArrow.style.background = "#f16f90";
      }

      if (event.code === "ArrowLeft") {
        this.elements.leftArrow.style.background = "#f16f90";
      }

      if (event.code === "ArrowLeft") {
        this.elements.leftArrow.style.background = "#f16f90";
      }

      if (event.code === "Backspace") {
        this.elements.backspace.style.background = "#f16f90";
      }

      for (const key of this.elements.keys) {
        if (key.childElementCount === 0 && key.getAttribute("keycode") == event.keyCode) {
            key.style.background = "#f16f90";
        }
      }

    });
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<icon class="material-icons" transform: scale()>${icon_name}</icon>`;
    };
    // this.properties.layout = this.keyLayouts[this.properties.lang][0];
    this.keySceleton.forEach(line => { 
      line.forEach(button => {
        const keyElement = document.createElement("button");      

        // Add attributes/classes
        keyElement.setAttribute("type", "button");
        keyElement.classList.add("keyboard__key");

        switch (button) {
          case "backspace":
            keyElement.classList.add("keyboard__key--wide");
            keyElement.innerHTML = createIconHTML("backspace");
            this.elements.backspace = keyElement;
            keyElement.addEventListener("click", () => {
              this.properties.value = [this.properties.value.slice(0, this.properties.cursorPos - 1),
                                      this.properties.value.slice(this.properties.cursorPos)].join('');
              if (this.properties.cursorPos > 0) {
                this.properties.cursorPos -= 1;
                this.properties.selectPos = this.properties.cursorPos;
              }
              this._triggerEvent("oninput");
              this._museBackspace();
            });
            break;

          case "caps":
            keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
            keyElement.innerHTML = createIconHTML("keyboard_capslock");
            this.elements.capslock = keyElement;
            keyElement.addEventListener("click", () => {
              this._toggleCapsLock();
              keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
              this._museCaps();
            });
            break;

          case "enter":
            keyElement.classList.add("keyboard__key--wide");
            keyElement.innerHTML = createIconHTML("keyboard_return");
            this.elements.enter = keyElement;
            keyElement.addEventListener("click", () => {              
              this.properties.value = [this.properties.value.slice(0, this.properties.cursorPos),
                "\n",
                this.properties.value.slice(this.properties.cursorPos)].join('');
              this.properties.cursorPos += 1;
              this.properties.selectPos = this.properties.cursorPos;
              this._triggerEvent("oninput");
              this._museEnter();
            });
            break;

          case "space":
            keyElement.classList.add("keyboard__key--extra-wide");
            keyElement.innerHTML = createIconHTML("space_bar");
            this.elements.space = keyElement;
            keyElement.addEventListener("click", () => {
              //this.properties.value += " ";
              this.properties.value = [this.properties.value.slice(0, this.properties.cursorPos),
                " ",
                this.properties.value.slice(this.properties.cursorPos)].join('');
              this.properties.cursorPos += 1;
              this.properties.selectPos = this.properties.cursorPos;
              this._triggerEvent("oninput");
              this._museSpace();
            });
            break;

          case "done":
            keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
            keyElement.innerHTML = createIconHTML("check_circle");
            keyElement.addEventListener("click", () => {
              this.properties.cursorPos = this.properties.value.length;
              this.properties.selectPos = this.properties.cursorPos;
              this.close();            
              this._triggerEvent("onclose");
              this._museRemove();
            })
            break;

          case "shift":
            keyElement.classList.add("keyboard__key--wide--newIconCenter", "keyboard__key--activatable");
            keyElement.innerHTML = createIconHTML("⇧");
            // document.shift.style.paddingBottom = "0.5rem";
            // keyElement.textContent = "shift";
            this.elements.shift = keyElement;
            keyElement.addEventListener("click", () => {
              this._toggleShift(); 
              keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
              this._museShift();
            });
            break;
            //document.getElementById("id").getElementsByClassName("col-3")[0].style.paddingBottom='0rem'

          case "ru / en":
            keyElement.classList.add("keyboard__key--wide");            
            keyElement.textContent = "ru / en";
            this.elements.langChange = keyElement;
            keyElement.addEventListener("click", () => {              
              this._switchLayout();              
              this._muse();
              this.elements.textArea.focus();
            })
            break;

          case "←":
            keyElement.classList.add("keyboard__key--wide--newIconCenter");
            keyElement.innerHTML = createIconHTML("←");
            this.elements.leftArrow = keyElement;
            keyElement.addEventListener("click", () => {
              if (this.properties.cursorPos > 0) {                
                this.properties.cursorPos -= 1;
                if (!this.properties.shift) this.properties.selectPos = this.properties.cursorPos;
              }
              this._triggerEvent("oninput");
              this._muse();
            });
            break;

          case "→":
            keyElement.classList.add("keyboard__key--wide--newIconCenter");
            keyElement.innerHTML = createIconHTML("→");
            this.elements.rightArrow = keyElement;
            keyElement.addEventListener("click", () => {
              if (this.properties.cursorPos < this.properties.value.length) {                
                this.properties.cursorPos += 1;
                if (!this.properties.shift) this.properties.selectPos = this.properties.cursorPos;
              }
              this._triggerEvent("oninput");
              this._muse();
            });
            break;

          case "🎤":
            keyElement.classList.add("keyboard__key--wide--newIconCenter", "keyboard__key--activatable");
            keyElement.innerHTML = createIconHTML("🎤");
            this.elements.voiceInput = keyElement;
            keyElement.addEventListener("click", () => {
              this._museVoiceInput();              
              this.elements.recognition.addEventListener('result', e => {
                const transcript = Array.from(e.results)
                  .map(result => result[0])
                  .map(result => result.transcript)
                  .join('');
                  if (e.results[0].isFinal) {
                    //this.properties.value += transcript + "\n";
                    this.properties.value = [this.properties.value.slice(0, this.properties.cursorPos),
                      transcript + " ",
                      this.properties.value.slice(this.properties.cursorPos)].join('');
                    this.properties.cursorPos += transcript.length;
                    this.properties.selectPos = this.properties.cursorPos                    
                  }
                  this._triggerEvent("oninput");
              });
              this.elements.recognition.addEventListener('end', () => {              
                if (this.properties.voiceInput) {
                  this.elements.recognition.start()
                }
                this._triggerEvent("oninput");
              });
              this._toggleVoiceInput();
              keyElement.classList.toggle("keyboard__key--active", this.properties.voiceInput);

            });
          // this.button.style.paddingBottom = "0.5rem";
          // keyElement.addEventListener("click", () => {            
          // });
            break;

          case "🔔":
            keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");            
            keyElement.textContent = "🔔";
            this.elements.muse = keyElement;
            keyElement.addEventListener("click", () => { 
              this._switchMuse(); 
              keyElement.classList.toggle("keyboard__key--active", this.properties.muse);            
              this._museMuse();
              // keyElement.classList.toggle("keyboard__key--active", this.properties.lang === "ru");
            });
            break;

          default:
            let keyIndex = this.keySceleton.flat().indexOf(button)
            keyElement.textContent = this.keyLayouts[this.properties.lang][0][keyIndex];
            keyElement.setAttribute("keyCode", button);
            keyElement.addEventListener("click", () => {
              let shift = this.properties.shift ? 1 : 0;
              let char = "";
              let buttonValue = "";
              let keyIndex = this.keySceleton.flat().indexOf(button)    

              keyElement.textContent = this.keyLayouts[this.properties.lang][shift][keyIndex];
              buttonValue = this.keyLayouts[this.properties.lang][shift][keyIndex];

              if (this.properties.capsLock && this.properties.shift) {
                char = buttonValue.toLowerCase();
              }
              
              if (this.properties.capsLock == false && this.properties.shift) {
                char = buttonValue;
              }

              if (this.properties.capsLock && this.properties.shift == false) {
                keyElement.textContent = keyElement.textContent.toUpperCase();
                char = buttonValue.toUpperCase();
              }

              if (this.properties.capsLock == false && this.properties.shift == false) {
                char = buttonValue.toLowerCase();
              }

              this.properties.value = [this.properties.value.slice(0, this.properties.cursorPos),
                                        char,
                                        this.properties.value.slice(this.properties.cursorPos)].join('');
              this.properties.cursorPos += 1;
              this.properties.selectPos = this.properties.cursorPos;
              this._triggerEvent("oninput");
              this._muse();
            });
        }
        fragment.appendChild(keyElement);
      });
      fragment.appendChild(document.createElement("br"));
    });

    return fragment;
  },

  _toggleVoiceInput() {
    this.properties.voiceInput = !this.properties.voiceInput;

    if (this.properties.is_chrome) {
      if (this.properties.voiceInput) {   

        this.elements.recognition.start();

      } else {
        this.elements.recognition.stop();
      }
    } else {
      this.properties.voiceInput = false;
    //   showError(errorText) {
    //     alterMessage.textContent = errorText
    //     alterBox.style.display = "block";        
    // }
      // this.alterMessage.textContent = "Не работаю в этом браузере.\n\nПопробуйте chrom или edge";
      alterBox.style.display = "block";
      alert("Не работаю в этом браузере.\n\nПопробуйте chrom или edge");
    }
  },

  _toggleShift() {
    this.properties.shift = !this.properties.shift;
    let shiftLayout = [];

    if(this.properties.shift) {
      shiftLayout = this.keyLayouts[this.properties.lang][1];
      //this.elements.textArea.select();
    } else {
      shiftLayout = this.keyLayouts[this.properties.lang][0];
      //this.elements.textArea.unSelect();
      //this.elements.textArea.blur();
    }

    this.elements.keys.forEach((key, index) => {
      if (key.childElementCount === 0 && this.properties.capsLock === false) {
        key.textContent = shiftLayout[index];
      }
    });
  },

  _museEnter() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/enter.mp3";
      audio.autoplay = true;
    }
  },
  _museMuse() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/muse.mp3";
      audio.autoplay = true;
    }
  },
  _museCaps() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/caps.mp3";
      audio.autoplay = true;
    }
  },
  _museBackspace() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/backspase.mp3";
      audio.autoplay = true;
    }
  },
  _museSpace() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/space.mp3";
      audio.autoplay = true;
    }
  },
  _museShift() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/shift.mp3";
      audio.autoplay = true;
    }
  },
  _museVoiceInput() {
    if (this.properties.muse) {
      let audio = new Audio();
      audio.src = "./assets/sounds/voice_input.mp3";
      audio.autoplay = true;
    }
  },
  _muse() {
    let audio = new Audio();
    if (this.properties.muse) {
      if (this.properties.lang === "ru") {
        audio.src = "./assets/sounds/keypress_ru.mp3";
        audio.autoplay = true;
      }
      else {
        audio.src = "./assets/sounds/keypress_en.mp3";
        audio.autoplay = true;
      }
    }
  },
  _museRemove() {
    if (this.properties.muse === true) {
      let audio = new Audio();
      audio.src = "./assets/sounds/remove.mp3";
      audio.autoplay = true;
    }
  },
  _switchMuse() {
    this.properties.muse = !this.properties.muse;
  },

  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == "function") {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  _switchLayout() {
    let newLayout = [];   

    if (this.properties.lang === "en") {
      this.properties.lang = "ru";
      if(this.properties.is_chrome) this.elements.recognition.lang = 'ru-RU';
    } else {
      this.properties.lang = "en";
      if(this.properties.is_chrome) this.elements.recognition.lang = 'en-US';
    }

    if (this.properties.shift) {
      newLayout = this.keyLayouts[this.properties.lang][1];
    } else {
      newLayout = this.keyLayouts[this.properties.lang][0];
    }

    this.elements.keys.forEach((key, index) => {
      if (key.childElementCount === 0) {
        key.textContent = newLayout[index];
      }
    });
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0 && this.properties.shift === false) {
        key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
      }
    }
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove("keyboard--hidden");
  },

  close() {
    this.properties.value = "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add("keyboard--hidden");
  }
};

/* --------------const Keyboard END----------------------  */

window.addEventListener("DOMContentLoaded", function () {      
  const textArea = document.querySelector(".text_input");
  Keyboard.init(textArea);
});
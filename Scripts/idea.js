const ideaLine = document.querySelector('.idea-page .idea-line')

const ideaMaintitle = document.querySelector('.idea-page .main-title .text');
const ideaSubtitle = document.querySelector('.idea-page .sub-title .text');

const ideaInput = document.querySelector('.idea-page .sub-title .reality input');
const ideaOutput = document.querySelector('.idea-page .sub-title .reality .output');

let ideaMaterialized = false, materializeId = null, ideaRealitySlideId = null, allowMaterialize = false;
let ideaInputAnimationComplete = false;
const placeholderText = "type your idea...";
let ideaLineRect = ideaLine.getBoundingClientRect();

window.addEventListener('scroll', () => {
    ideaLineRect = ideaLine.getBoundingClientRect();
});

window.addEventListener('resize', () => {
    ideaLineRect = ideaLine.getBoundingClientRect();
});

document.addEventListener('DOMContentLoaded', function () {
    /*document.addEventListener('ideaHalfIntersection', function () {
        if (ideaHalfIntersecting) {
            ideaSubtitle.classList.add('slide-down');
            ideaMaintitle.classList.add('slide-up');

            if (!ideaMaterialized) {
                ideaRealitySlideId = setTimeout(() => {
                    ideaInput.classList.add('slide-down-reality');
                    materializeId = setTimeout(() => {
                        ideaMaterialized = true;
                        allowMaterialize = true;
                        ideaInput.classList.remove('slide-down-reality');
                        ideaInput.style.transform = 'translateY(-11%)';
                        ideaInput.style.pointerEvents = 'all';
                        materializeId = null;
                        if (!ideaInputAnimationComplete) ideaInputAnimation();
                        realityToMatter();
                    }, 1100);
                }, 130);
            }
        } else {
            ideaSubtitle.classList.remove('slide-down');
            ideaMaintitle.classList.remove('slide-up');
            if (!ideaMaterialized) {
                if (ideaRealitySlideId != null) clearTimeout(ideaRealitySlideId);
                ideaInput.classList.remove('slide-down-reality');
                ideaRealitySlideId = null;
                if (materializeId != null) {
                    clearTimeout(materializeId);
                    materializeId = null;
                }
            }
        }
    });*/

	document.addEventListener('ideaHalfIntersection', slideDown);
});

function slideDown() {
	if (ideaHalfIntersecting) {
		ideaSubtitle.classList.add('slide-down');
		ideaMaintitle.classList.add('slide-up');

		if (!ideaMaterialized) {
			ideaRealitySlideId = setTimeout(() => {
				ideaInput.classList.add('slide-down-reality');
				materializeId = setTimeout(() => {
					ideaMaterialized = true;
					allowMaterialize = true;
					ideaInput.classList.remove('slide-down-reality');
					ideaInput.style.transform = 'translateY(-11%)';
					ideaInput.style.pointerEvents = 'all';
					materializeId = null;
					if (!ideaInputAnimationComplete) ideaInputAnimation();
					realityToMatter();
				}, 1100);
			}, 130);
		}
		document.removeEventListener('ideaHalfIntersection', slideDown);
	}
}

ideaInput.addEventListener('keydown', function(event) {
    if (!ideaInputAnimationComplete) {
        clearInterval(ideaInputAnimationId);
        ideaInput.placeholder = placeholderText;
    }
    const maxWidth = ideaInput.offsetWidth * 0.9;
    const contentWidth = getTextWidth(ideaInput.value, getComputedStyle(ideaInput).font);
    const keyCode = event.keyCode || event.which;
    if (keyCode === 8) return;
    if (keyCode === 13 && ideaInput.value.length > 0) {
        event.preventDefault();
        realityToMatter();
    }
    if (contentWidth >= maxWidth || ideaInput.value.length >= 30) event.preventDefault();
});

function ideaInputAnimation() {
    ideaInputAnimationComplete = true;
    var i = 0;
    ideaInputAnimationId = setInterval(() => {
        if (i == placeholderText.length) {
            clearInterval(ideaInputAnimationId);
            ideaInputAnimationId = null;
        } else ideaInput.placeholder = ideaInput.placeholder + placeholderText[i++];
    }, 100);
}

function realityToMatter() {
    if (ideaInput.textContent.trim() != "" || !allowMaterialize) return;
    allowMaterialize = false;
    ideaOutput.textContent = ideaInput.value.trim();
    ideaInput.value = "";

    var wordElement = spanifyWord(ideaOutput);
    var ideaWords = [];
    wordElement.forEach(word => {
        ideaWords.push(new IdeaWord(word));
    });

    anime({
        targets: ideaOutput.querySelectorAll('.word'),
        keyframes: [
            {translateY: '50%', easing: 'easeOutQuart', duration: 500},
            {translateY: '-100%', easing: 'easeOutQuart', duration: 400}
        ],
        delay: ideaWords.length == 1 ? 50 : anime.stagger(50, {easing: 'easeInQuad'}),
        update: function(anim) {
            ideaWords.forEach(word => {
                if (anim.progress > 0.4 && !word.spawned) word.checkIntersectionOnce();
            })
        },
        complete: function(anim) {
            ideaWords.forEach(word => {
                word.delete();
            });
            allowMaterialize = true;
        },
    });
}

class IdeaWord {
    constructor(element) {
        this.word = element;
        this.intersectionId = null;
        this.rect = this.word.getBoundingClientRect();
        this.spawned = false;
    }

    checkIntersectionOnce() {
        this.rect = this.word.getBoundingClientRect();
        if (this.rect.bottom - this.rect.height/2 < ideaLineRect.top) {
            this.word.style.color = 'transparent';
            printer.print({
                text: this.word.textContent,
                size: 0.018,
                x: this.rect.left,
                y: ideaLineRect.top + window.scrollY,
                relPosition: false,
                relSize: true,
                color: [blue, green, yellow, red],
                category: charCategory,
                mask: charCategory,
            }).forEach(letter => {
                Body.setVelocity(letter, Vector.create(0, -0.004 * (matterInstance.container.clientHeight/2)));
            });
            this.spawned = true;
        }
    }

    checkIntersection() {
        this.intersectionId = setInterval(() => {
            this.rect = this.word.getBoundingClientRect();
            if (this.rect.bottom - this.rect.height/2 + window.scrollY < ideaLineRect.top) {
                clearInterval(this.intersectionId);
                this.intersectionId = null;
                this.word.style.color = 'transparent';
                printer.print({
                    text: this.word.textContent,
                    size: 0.018,
                    x: this.rect.left,
                    y: ideaLineRect.top,
                    relPosition: false,
                    relSize: true,
                    color: [blue, green, yellow, red],
                    category: charCategory,
                    mask: charCategory,
                }).forEach(letter => {
                    Body.setVelocity(letter, Vector.create(0, -0.004 * (matterInstance.container.clientHeight/2)));
                })
            }
        }, 10);
    }

    delete() {
        this.word.remove();
    }
}
import $ from 'jquery';

export default class FloatingLabels {
    constructor(panel, lastItem){
        this._panel = panel;
        this._lastItem = lastItem;
        this._clone = null;

        this._onScroll = () => this._handleScroll();
        this._init();
    }

    _init(){
        if(this._panel.length === 0) {
            return;
        }

        this._clone = this._panel
            .clone()
            .addClass('cf-label-panel--floating')
            .hide()
            .insertAfter(this._panel);

        $(window).on('resize', ()=> this._adjust());

        this._adjust();
    }

    _adjust() {
        this._clone.css({
            width: this._panel.outerWidth() + 'px',
            left: this._panel.offset().left
        });

        if(window.innerWidth <= 640) {
            this._float();
        }
        else {
            this._hide();
        }
    }

    _float() {
        this._panelOffset = this._panel.offset().top;
        this._maxOffset = this._lastItem.offset().top - this._clone.outerHeight();

        $(window).on('scroll', this._onScroll);
        this._onScroll();
    }

    _hide() {
        this._clone.hide();
        $(window).off('scroll', this._onScroll);
    }

    _handleScroll() {
        const scrollValue = $(window).scrollTop();

        if(scrollValue < this._panelOffset) { // above the topmost panel
            this._clone.hide();
        }else if( scrollValue > this._maxOffset + this._clone.outerHeight()) { // below last item
            this._clone.hide();
        } else {
            const fixedTop = scrollValue > this._maxOffset
                ? this._maxOffset - scrollValue
                : 0;
            this._clone.css({
                top: fixedTop + 'px'
            }).show();
        }
    }
}
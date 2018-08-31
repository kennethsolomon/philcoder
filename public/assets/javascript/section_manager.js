"use strict";
class SectionManager {
    constructor(theUser, classid, id = null, orderno) {
        this.theUser = theUser;
        this.classid = classid;
        this.sectionid;
        this.cards = [];
        this.orderno = orderno;

        if (id) {
            this.sectionid = id;
        } else {
            return;
        }

        var sectionelement = `
            <div class="card class-section" id="sectionid_${this.sectionid}" style="order: ${this.orderno};">
                <div class="card-header section-header" id="section_heading${this.sectionid}">
                    <p>

                        <div class="btn-group section-controls" role="group" aria-label="Basic example">
                            <div class="cmain">
                                <button type="button" id="addcard${this.sectionid}" class="btn btn-link addcard"> 
                                    <i class="material-icons">add</i>
                                </button>
                                    <div class="mdl-tooltip" data-mdl-for="addcard${this.sectionid}">Add card</div>

                                <button type="button" id="listview${this.sectionid}" class="btn btn-link listview">
                                    <i class="material-icons">view_list</i>
                                </button>
                                    <div class="mdl-tooltip" data-mdl-for="listview${this.sectionid}">List view</div>

                                <button type="button" id="sortcard${this.sectionid}" class="btn btn-link sortcard">
                                    <i class="material-icons">sort</i>
                                </button> 
                                    <div class="mdl-tooltip" data-mdl-for="sortcard${this.sectionid}">Sort cards</div> 
                            </div>  
                            <button type="button" id="closesection${this.sectionid}" class="btn btn-link closesection">
                                <i class="material-icons">delete</i>
                            </button> 
                                <div class="mdl-tooltip" data-mdl-for="closesection${this.sectionid}">Delete section</div> 
                        </div>

                        <div class="btn btn-link sectionlabel" id="sectionlabel${this.sectionid}" style="padding: 0px; float: left;" data-toggle="collapse" data-target="#section_body${this.sectionid}" aria-expanded="false" aria-controls="section_body${this.sectionid}">
                            
                        </div>

                        <button type="button" id="editlabel${this.sectionid}" class="btn btn-link editlabel">
                                <i class="material-icons editlabel">edit</i>
                        </button> 
                            <div class="mdl-tooltip mdl-tooltip--right" data-mdl-for="editlabel${this.sectionid}">Edit</div> 
                       
                    </p>
                </div>

                <div id="section_body${this.sectionid}" class="section-body collapse" aria-labelledby="section_body${this.sectionid}" data-parent="#accordionExample">
                    <div class="card-body">
                        <div class="create-card-cont">
                            
                        </div>   
                    </div>
                </div>
            </div>
        `;
        $(sectionelement).appendTo('.create-section-cont').hide().show('fade'); //apply fade effects 

        //new CardManager(this.theUser, this.sectionid, '1234');
        //return;

        $('#sectionid_' + this.sectionid).find('.create-card-cont').sortable({ //this makes class cards sortable
            update: (event, ui) => {
                this.updateSectionCardList();
            }
        });
        $('#sectionid_' + this.sectionid).find('.create-card-cont').sortable({
            forcePlaceholderSize: true
        });
        $('#sectionid_' + this.sectionid).find('.create-card-cont').sortable('disable'); //disable sortable

        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('sectionid_' + this.sectionid));

        this.setEventHandlers();

        var database = firebase.database();
        var setcardChangeListener = (sectionid) => {

            this.cardRef = database.ref('card/' + this.theUser.uid + '/sectionid_' + sectionid);
            this.orderedCardRef = database.ref('card/' + this.theUser.uid + '/sectionid_' + sectionid).orderByChild('sort_order_no');

            this.orderedCardRef.on('child_added', (data) => {
                //var sectionid = data.val().sectionid;
                var cardid = data.key;
                cardid = cardid.substring(7, cardid.length);
                var isDeleted = data.val().isDeleted;
                var sort_order_no = data.val().sort_order_no;

                if (!isDeleted) {
                    var card = new CardManager(this.theUser, sectionid, cardid, sort_order_no);
                    card.setTitle(data.val().title);
                    card.setDescription(data.val().description);
                    this.cards.push(card);

                    this.cardRef.child('cardid_' + cardid).on('child_changed', (data) => {
                        var field = data.key;
                        var value = data.val();

                        if (field == 'isDeleted') {

                            if (value) {

                                for (let i = 0; i < this.cards.length; i++) {
                                    if (this.cards[i].cardid == cardid) {
                                        this.cards[i].detachListeners();
                                        $('#cardid_' + cardid).hide('clip', () => {
                                            $('#cardid_' + cardid).remove();
                                        });
                                    }
                                }

                            } else {

                                this.cardRef.child('cardid_' + cardid).once('value', (snapcard) => {
                                    var cardid = snapcard.key;
                                    cardid = cardid.substring(7, cardid.length);

                                    var card = new CardManager(this.theUser, sectionid, cardid, snapcard.val().sort_order_no);
                                    card.setTitle(snapcard.val().title);
                                    card.setDescription(snapcard.val().description);

                                    for (let i = 0; i < this.cards.length; i++) {
                                        if (this.cards[i].cardid == cardid) {
                                            this.cards[i] = card;
                                        }
                                    }

                                });
                            }

                        } else if (field == 'title') {
                            var my_mod_key = sessionStorage.getItem('cardid_' + cardid);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap) => {
                                var last_modified_key = snap.val()
                                if (last_modified_key != my_mod_key) {
                                    $('#cardid_' + cardid).find('.card_title').val(value);
                                } else {
                                    //console.log('this');
                                }
                            });
                        } else if (field == 'description') {
                            var my_mod_key = sessionStorage.getItem('cardid_' + cardid);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap) => {
                                var last_modified_key = snap.val()
                                if (last_modified_key != my_mod_key) {
                                    $('#cardid_' + cardid).find('.card_des').val(value);
                                } else {
                                    //console.log('this');
                                }
                            });
                        } else if (field == 'sort_order_no') {
                            var my_mod_key = sessionStorage.getItem('cardid_' + cardid);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap) => {
                                var last_modified_key = snap.val()
                                if (last_modified_key != my_mod_key) {

                                    var card = document.getElementById(`cardid_${cardid}`);
                                    var card_container = card.parentElement;
                                    card.remove();

                                    card.style.order = value;
                                    card_container.insertBefore(card, card_container.childNodes[value + 1]);

                                } else {
                                    //console.log('this');
                                    document.getElementById(`cardid_${cardid}`).style.order = value;
                                }
                            });

                        }
                    });

                }

            });
        }
        setcardChangeListener(this.sectionid);

    }

    setlabel(text) {
        $(`#sectionlabel${this.sectionid}`).text(text);
    }

    setEventHandlers() {

        $('#addcard' + this.sectionid).click((e) => {
            this.savecardinfo();
        });

        $('#listview' + this.sectionid).click((e) => {
            var c = e.currentTarget;

            if (c.firstElementChild.textContent === 'view_list') {

                this.setcardsView('list'); //this function set cards view to list view
                c.firstElementChild.textContent = 'view_module'; //changes the listview button icon to large view
                c.nextElementSibling.textContent = 'Grid view'; //makes this button tooltip text to "Grid view"

            } else {

                this.setcardsView('grid'); //this function set cards view to grid view
                c.firstElementChild.textContent = 'view_list'; //changes the listview button icon to list view
                c.nextElementSibling.textContent = 'List view'; //makes this button tooltip text to "List view"

            }

            $("[data-toggle='tooltip']").tooltip('hide'); //this makes tooltip refresh its text content

            this.cardsShowEffect(); //show all card with effects

        });

        $('#sortcard' + this.sectionid).click((e) => {
            var c = e.currentTarget;
            var cards = $('#sectionid_' + this.sectionid).find('.create-card-cont').children(); //get all cards

            if (c.firstElementChild.textContent === 'sort') {

                c.firstElementChild.textContent = 'done_all'; //changes the sortcard button icon to done_all
                c.nextElementSibling.textContent = 'Done';

                this.setcardsView('list'); //this function set cards view to list view

                for (let i = 0; i < cards.length; i++) {
                    $(cards[i]).css({
                            'cursor': 'move'
                        }) //sets all cards height to max-content
                        .find('.card-view-but').attr('disabled', 'true'); //when sorting are enable for cards we dont to allow the card to be view larger
                    $(cards[i]).find('.card-sort-but').attr('disabled', 'true'); //when sorting are enable for cards we dont to allow the card to sort its child items
                }

                $('#listview' + this.sectionid).attr('disabled', 'true'); //disable listview button
                $('#addcard' + this.sectionid).attr('disabled', 'true'); //disable add card button

                $('#sectionid_' + this.sectionid).find('.create-card-cont')
                    .css({
                        'background-color': 'rgb(230, 226, 226)',
                        'display': 'block'
                    })
                    .sortable('enable') //ofcourse enable the sortable feature
                    .sortable({
                        //connectWith: ".create-card-cont",
                        start: function (e, ui) {
                            ui.placeholder.height(ui.item.height());
                        }
                    });

                this.cardsShowEffect(); //show all card with effects

            } else {

                c.firstElementChild.textContent = 'sort'; //changes the button icon to list view
                c.nextElementSibling.textContent = 'Sort cards'; //makes this button tooltip text to "Sort cards" 

                $('#listview' + this.sectionid)
                    .html('<i class="material-icons">view_module</i>') //changes the listview button icon to large view
                    .removeAttr("disabled") //enable the listview button
                    .next().text('Grid view'); //enable listview button and makes tooltip text to "Grid view"
                $('#addcard' + this.sectionid).removeAttr("disabled") //enable the add card button

                for (let i = 0; i < cards.length; i++) {
                    $(cards[i]).css({
                            'cursor': 'default'
                        }) //sets all cards cursor to default
                        .find('.card-view-but')
                        .html('<i class="material-icons">view_module</i>') //this makes all cards view button(beside close button) to be large view
                        .removeAttr("disabled");

                    $(cards[i]).find('.card-sort-but').removeAttr("disabled");
                }

                $('#sectionid_' + this.sectionid).find('.create-card-cont')
                    .css({
                        'background-color': 'white',
                        'display': 'flex'
                    })
                    .sortable('disable'); //disable sortable

            }

        });

        $('#closesection' + this.sectionid).click((e) => { //set up close button event handler
            var c = e.currentTarget;
            if (confirm('Are you sure you want to remove this section?')) {
                this.deleteSection();
            }
            return;
        });

        $('#sectionid_' + this.sectionid).find('.cmain')
            .fadeOut("fast");

        $(`#section_body${this.sectionid}`).on('shown.bs.collapse', () => {
            $('#sectionid_' + this.sectionid).find('.cmain')
                .fadeIn("fast");
        });
        $(`#section_body${this.sectionid}`).on('hidden.bs.collapse', () => {
            $('#sectionid_' + this.sectionid).find('.cmain')
                .fadeOut("fast");
        });

        var sectionlabel = document.getElementById(`sectionlabel${this.sectionid}`);
        var editlabel = document.getElementById(`editlabel${this.sectionid}`);
        editlabel.addEventListener('click', (e) => {
            e.currentTarget.style.display = 'none';
            sectionlabel.setAttribute('contenteditable', 'true');
            sectionlabel.focus();

            /*sectionlabel.addEventListener('keyup',(e)=>{
                e.preventDefault();
                if (e.keyCode === 13) {  
                    e.currentTarget.removeAttribute('contenteditable'); 
                    editlabel.style.display = 'block';
                    this.saveinfo('label', e.currentTarget.textContent);
                }
            });*/

            $(sectionlabel).on('keypress', (e) => {
                    var code = e.keyCode || e.which;
                    if (code == 13) {
                        e.preventDefault();
                    }
                }).on('paste', (e) => {
                    $('br,p', this).replaceWith(' ');
                })
                .on('input', (e) => {
                    this.saveinfo('label', e.currentTarget.textContent);
                })
                .focusout((e) => {
                    e.currentTarget.removeAttribute('contenteditable');
                    editlabel.style.display = 'block';
                    //this.saveinfo('label', e.currentTarget.textContent);
                });

        });

    }

    setcardsView(viewtype) {
        var cards = $('#sectionid_' + this.sectionid).find('.create-card-cont').children(); //get all cards
        if (viewtype == 'list') {
            for (let i = 0; i < cards.length; i++) {

                $(cards[i]).css({
                    'height': '80px'
                }); //sets all cards height to 80px
                $(cards[i]).find('.elements-items-container').css({
                    'display': 'none'
                }); //Hides all cards contents
                $(cards[i]).find('.card-panel').css({
                    'display': 'block'
                }); //Displays the cards panel for listview
                $(cards[i]).find('.card-view-but').children('i').text('view_module'); //this makes all cards view button(beside close button) to be large view

                let cardid = cards[i].getAttribute('id'); //get the card id
                let card_title = $(cards[i]).find('.card_title').val(); //card title
                let card_des = $(cards[i]).find('.card_des').val(); //card description

                var elements = $(cards[i]).find('.card-panel').children(); //get reference to card panel h5(title) and p(description)

                $(elements[0]).text(card_title); //set title to h5 tag
                $(elements[1]).text(card_des.substring(0, 40) + '...'); //set description to paragraph tag

                if (!card_title) {
                    $(elements[0]).text('Card title here..'); //set empty title to h5 tag
                }
                if (!card_des) {
                    $(elements[1]).text('Card description here..'); //set empty description to paragraph tag
                }
            }
        } else {
            for (let i = 0; i < cards.length; i++) {
                $(cards[i]).css({
                    'height': 'auto'
                }); //sets all cards height to auto
                $(cards[i]).find('.elements-items-container').css({
                    'display': 'block'
                }); //Displays all cards contents
                $(cards[i]).find('.card-panel').css({
                    'display': 'none'
                }); //Hides the cards panel
                $(cards[i]).find('.card-view-but').children('i').text('view_list'); //this makes all cards view button(beside close button) to be List view
            }
        }
    }

    cardsShowEffect() {
        var cards = $('#sectionid_' + this.sectionid).find('.create-card-cont').children(); //get all cards
        for (let i = 0; i < cards.length; i++) {
            $(cards[i]).hide().show('fade'); //apply clip effects 
        }
    }

    updateSectionCardList() {

        var updates = {},
            cardidlist = [],
            cards = $('#sectionid_' + this.sectionid).find('.create-card-cont').children(); //get all sections
        let modkey = (new Date()).getTime().toString(36); //creates new last modified key

        for (let d = 0; d < cards.length; d++) {
            let cardid = cards[d].getAttribute('id');
            sessionStorage.setItem(cardid, modkey);

            cardidlist.push(cardid); //it collect all of the section id 
            updates['card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/' + cardid + '/last_modified_key'] = modkey;
            updates['card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/' + cardid + '/sort_order_no'] = d;
        }

        updates['section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid + '/card_list'] = cardidlist;

        firebase.database().ref().update(updates)
            .then(() => {
                console.log('Section card list Updated');
            }).catch((err) => {
                console.log(err);
                console.log("failed to update");
            });
    }

    saveinfo(fields, value) {

        let modkey = (new Date()).getTime().toString(36); //creates new last modified key
        sessionStorage.setItem('sectionid_' + this.sectionid, modkey);

        var updates = {}
        updates['section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid + '/last_modified_key/'] = modkey;
        updates['section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid + '/' + fields] = value.trim();
        firebase.database().ref().update(updates)
            .then(() => {
                console.log('Section saved');
            }).catch((err) => {
                console.log(err);
            });
    }

    deleteSection() {
        firebase.database().ref('section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid).update({
                'isDeleted': true
            })
            .then(() => {
                this.showUndoSnackBar();
                console.log('Section Deleted');
            }).catch((err) => {
                console.log(err);
            });
    }

    showUndoSnackBar() {
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event) => {
            firebase.database().ref('section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid).update({
                    'isDeleted': false
                })
                .then(() => {}).catch((err) => {
                    console.log(err);
                });
        };

        var data = {
            message: 'Section deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    detachListeners() {
        this.orderedCardRef.off();

        for (let card of this.cards) {
            this.cardRef.child('cardid_' + card.cardid).off();
            card.detachListeners();
        }
    }

    /* Save card */
    savecardinfo() {

        let cardid = (new Date()).getTime().toString(36); //creates new card id
        let modkey = (new Date()).getTime().toString(36); //creates new last modified key
        sessionStorage.setItem('cardid_' + cardid, modkey);

        var cardinfo = {
            sectionid: 'sectionid_' + this.sectionid,
            isDeleted: false,
            sort_order_no: this.cards.length,
            last_modified_key: modkey,
            title: '',
            description: ''
        };

        firebase.database().ref('card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + cardid).set(cardinfo)
            .then(() => {
                console.log('Card saved');
                this.addsectioncard('cardid_' + cardid);
            }).catch((err) => {
                console.log(err);
            });
    }

    addsectioncard(cardid) {
        let Ref = 'section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + this.sectionid + '/card_list/';
        firebase.database().ref(Ref)
            .once('value', (snap) => {

                firebase.database().ref(Ref + (snap.val() ? snap.val().length : 0)).set(cardid)
                    .then(() => {}).catch((err) => {
                        console.log(err);
                    });

            });

    }
}
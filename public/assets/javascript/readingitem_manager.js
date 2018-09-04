"use strict";
class ReadingItemManager {
    constructor(theUser, cardid, id = null, orderno) {
        this.theUser = theUser;
        this.cardid = cardid; //also get the parent card id of this newly created reading list item, we pass it through our constructor of this class
        this.itemid;
        this.type = 'readinglist';
        this.items = [];
        this.orderno = orderno;

        if (id) {
            this.itemid = id;
        } else {
            return;
        }

        //this will be the new reading list item for a card
        var element = `<div id="carditemid_${this.itemid}" class="carditem readinglist" data-type="readinglist">
                        <div class="contentbar">
                            <!-- Default dropleft button -->
                            <div class="dropleft">
                                <!-- Right aligned menu below button -->
                                <button id="demo-menu-lower-right-${this.itemid}" class="mdl-button mdl-js-button mdl-button--icon" style="outline: none;">
                                    <i class="material-icons">more_vert</i>
                                </button>
                                <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="demo-menu-lower-right-${this.itemid}">
                                    <li class="mdl-menu__item">
                                        <a class="dropdown-item btn-sort-items" style="cursor: pointer; background-color: transparent;">Sort items</a>
                                    </li>
                                    <li class="mdl-menu__item">
                                        <a class="dropdown-item btn-clear-items" style="cursor: pointer; background-color: transparent;">Clear all items</a>
                                    </li>
                                    <!--<li disabled class="mdl-menu__item">Disabled Action</li>-->
                                </ul>
                            </div>
                            <div class="items-container">
                                <ul>

                                </ul>                              
                            </div>                    
                        </div>
                        <div class="sidebar">
                            <ul>
                                <li class="btn-textbox">                                   
                                    <span style="cursor: pointer;">
                                        <i class="material-icons">text_fields</i>
                                        Text box
                                    </span>
                                </li>
                                <li class="btn-table">                               
                                    <span style="cursor: pointer;">
                                        <i class="fa fa-table"></i>
                                        Table
                                    </span>
                                </li>
                                <li class="btn-list">                               
                                    <span style="cursor: pointer;">
                                        <i class="fa fa-list"></i>
                                        List
                                    </span>
                                </li>
                                <li class="btn-image">
                                    <span style="cursor: pointer;">
                                        <i class="material-icons">image</i>
                                        Image
                                    </span>
                                </li>
                                <li class="btn-qa">
                                    <span style="cursor: pointer;">
                                        <i class="material-icons">question_answer</i>
                                        Question-Options
                                    </span>
                                </li>
                                <li class="btn-ytlink">
                                    <span style="cursor: pointer;">
                                        <i class="material-icons">video_library</i>
                                        Youtube
                                    </span>
                                </li>
                                <li class="btn-course_chart">
                                    <span style="cursor: pointer;">
                                        <i class="material-icons">show_chart</i>
                                        Chart
                                    </span>
                                </li>
                            </ul>
                        </div>
                      </div>`;

        //This will be container of every card items it includes the close and drag button
        var carditem = `<div id="carditem-con-id-${this.itemid}" class="carditem-container" style="order: ${this.orderno};">
                            <span class="carditem-close-but">
                                <i class="material-icons">close</i>
                            </span>
                            <span class="carditem-drag-but">
                                <i class="material-icons">reorder</i>
                            </span>
                            <div class="carditem-panel">
                                <h5>title here..</h5>
                                <p>description here..</p>
                            </div>
                            ${element}
                        </div>`;

        $(carditem).appendTo($('#cardid_' + this.cardid).find('.carditems-container')).hide().show('clip'); //apply clip effects 

        // This required to make the UI look correctly by Material Design Lite 
        componentHandler.upgradeElements(document.getElementById('carditem-con-id-' + this.itemid));

        this.setupEventHandlerListener();
        this.ReadingitemSortableManager();

        var database = firebase.database();
        var setitemChangeListener = (carditemid) => {

            this.itemRef = database.ref('item/' + this.theUser.uid + '/carditemid_' + carditemid);
            this.orderedItemRef = database.ref('item/' + this.theUser.uid + '/carditemid_' + carditemid).orderByChild('sort_order_no');

            this.orderedItemRef.on('child_added', (data) => {
                //var carditemid = data.val().carditemid;
                var itemid = data.key;
                itemid = itemid.substring(8, itemid.length);
                var itemtype = data.val().itemtype;
                var isDeleted = data.val().isDeleted;
                var sort_order_no = data.val().sort_order_no;

                if (!isDeleted) {

                    if (itemtype == 'qa') {
                        var quizitem = new QuizItemManager(this.theUser, carditemid, itemtype, itemid, sort_order_no); //create new Quiz item
                        quizitem.setQuestion(data.val().text);
                        this.items.push(quizitem);

                    } else if (itemtype == 'ytlink') {
                        var ytlink = new YoutubeManager(this.theUser, carditemid, itemtype, itemid, sort_order_no); //create new Youtube Link item
                        ytlink.setYTLink(data.val().ytlink);
                        this.items.push(ytlink);

                    }else if (itemtype == 'course_chart') {
                        var course_chart = new ChartItemManager(this.theUser, carditemid, itemtype, itemid, sort_order_no); //create new Youtube Link item
                        course_chart.setCourseTextData(data.val().text); // Path to get specific data on database.. change the .chart to change the target data
                        this.items.push(course_chart);

                    }
                     else {
                        var item = new ItemManager(this.theUser, carditemid, itemtype, itemid, sort_order_no); //create new item
                        item.setTextContent(data.val().text);
                        this.items.push(item);
                    }

                    this.itemRef.child('item-id-' + itemid).on('child_changed', (data) => {
                        var field = data.key;
                        var value = data.val();

                        if (field == 'isDeleted') {

                            if (value) {

                                for (let i = 0; i < this.items.length; i++) {
                                    if (this.items[i].itemid == itemid) {
                                        if (this.items[i].type == 'qa') {
                                            this.items[i].detachListeners()
                                        };
                                        $('#item-id-' + itemid).parents('li').fadeOut('slow', () => { //apply fadeOut effects before it removes
                                            $('#item-id-' + itemid).parents('li').remove(); //removes the current card selected
                                        });
                                    }
                                }

                            } else {

                                this.itemRef.child('item-id-' + itemid).once('value', (snapitem) => {
                                    let item;
                                    var itemid = snapitem.key;
                                    itemid = itemid.substring(8, itemid.length);
                                    var itemtype = snapitem.val().itemtype;

                                    if (itemtype === 'qa') {

                                        item = new QuizItemManager(this.theUser, carditemid, 'qa', itemid, data.val().sort_order_no); //create new Quiz item
                                        item.setQuestion(snapitem.val().text);

                                    } else if (itemtype === 'ytlink') {

                                        item = new YoutubeManager(this.theUser, carditemid, itemtype, itemid, data.val().sort_order_no); //create new Quiz item
                                        item.setYTLink(snapitem.val().ytlink);

                                    } else if (itemtype === 'course_chart') {

                                        item = new ChartItemManager(this.theUser, carditemid, itemtype, itemid, data.val().sort_order_no); //create new Quiz item
                                        item.setCourseTextData(snapitem.val().textData); // Path to get specific data on database.. change the .chart to change the target data
                                        item.setCourseTextDataValue(snapitem.val().textDataValue);
                                    }
                                     else {
                                        item = new ItemManager(this.theUser, carditemid, itemtype, itemid, data.val().sort_order_no); //create new item           
                                        item.setTextContent(snapitem.val().text);
                                    }

                                    for (let i = 0; i < this.items.length; i++) {
                                        if (this.items[i].itemid == itemid) {
                                            this.items[i] = item;
                                        }
                                    }

                                });

                            }

                        } else if (field == 'text') {
                            var my_mod_key = sessionStorage.getItem('item-id-' + itemid);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap) => {
                                var last_modified_key = snap.val()
                                if (last_modified_key != my_mod_key) {
                                    if (itemtype == 'qa') {
                                        $('#item-id-' + itemid).find('.txtquestion').val(value);
                                    } else {
                                        $('#carditemid_' + carditemid).find('#item-id-' + itemid).html(value);
                                    }

                                } else {
                                    //console.log('this');
                                }
                            });
                        } else if (field == 'sort_order_no') {
                            var my_mod_key = sessionStorage.getItem('item-id-' + itemid);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap) => {
                                var last_modified_key = snap.val()
                                if (last_modified_key != my_mod_key) {

                                    var item = document.getElementById(`item-con-id-${itemid}`).parentElement;
                                    var ul_container = item.parentElement;
                                    item.remove();

                                    item.style.order = value;
                                    ul_container.insertBefore(item, ul_container.childNodes[value + 1]);

                                } else {
                                    //console.log('this');
                                    document.getElementById(`item-con-id-${itemid}`).parentElement.style.order = value;
                                }
                            });

                        }

                    });

                }

            });
        }
        setitemChangeListener(this.itemid);
    }

    readURL(input, preview_element_id) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#' + preview_element_id).attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    //This method holds all of the click event listener for this reading list item
    setupEventHandlerListener() {

        $('#carditem-con-id-' + this.itemid).find('.btn-sort-items').click((e) => {
            var itemslength = $('#carditemid_' + this.itemid).find('.items-container ul').children().length;
            console.log('items length=' + itemslength);

            if (parseInt(itemslength) <= 0) {
                alert('Items is empty');
                return;
            }

            if ($(e.currentTarget).text() === 'Sort items') {
                $('#carditemid_' + this.itemid).find('div.items-container > ul').sortable('enable'); //enable sortable 
                $('#carditemid_' + this.itemid).find('div.items-container > ul').css({
                    'background-color': 'rgb(230, 226, 226)',
                    'display': 'block'
                });
                $('#carditemid_' + this.itemid).find('div.items-container > ul > li').css({
                    'background-image': 'url(assets/icons/baseline-dehaze-black-18/2x/baseline_dehaze_black_18dp.png)',
                    'cursor': 'move'
                });
                $('#carditemid_' + this.itemid).find('div.items-container > ul > li .editable').css({
                    'cursor': 'move'
                });
                $(e.currentTarget).text('Disable sort');
                $('#carditemid_' + this.itemid).find('div.sidebar ul li span').css({
                    'cursor': 'not-allowed'
                });
            } else {
                $('#carditemid_' + this.itemid).find('div.items-container > ul').sortable('disable'); //disable sortable 
                $('#carditemid_' + this.itemid).find('div.items-container > ul').css({
                    'background-color': 'white',
                    'display': 'flex'
                });
                $('#carditemid_' + this.itemid).find('div.items-container > ul > li').css({
                    'background-image': 'none',
                    'cursor': 'text'
                });
                $('#carditemid_' + this.itemid).find('div.items-container > ul > li .editable').css({
                    'cursor': 'text'
                });
                $(e.currentTarget).text('Sort items');
                $('#carditemid_' + this.itemid).find('div.sidebar > ul > li > span').css({
                    'cursor': 'pointer'
                });
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.btn-clear-items').click((e) => {
            var itemslength = $('#carditemid_' + this.itemid).find('.items-container ul').children().length;
            console.log(itemslength);

            if (parseInt(itemslength) <= 0) {
                alert('Items is empty');
                return;
            } else {

                if (confirm('Delete all items?')) {
                    this.deleteAllItem();
                }
            }

        });

        $('#carditem-con-id-' + this.itemid).find('.btn-textbox').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                //new ItemManager(this.theUser, this.itemid, "textbox");//create new item
                this.saveItem('textbox'); //create new item
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.btn-table').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('table'); //create new item
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.btn-list').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('list'); //create new item
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.btn-image').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('image'); //create new item
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.btn-qa').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('qa'); //create new item
            }
        });
        $('#carditem-con-id-' + this.itemid).find('.btn-ytlink').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('ytlink'); //create new item
            }
        });
        $('#carditem-con-id-' + this.itemid).find('.btn-course_chart').click((e) => {
            var isDisabled = $('#carditemid_' + this.itemid).find('div.items-container ul').sortable("option", "disabled");
            if (isDisabled) { //we dont allow to insert new item when sortable is enabled
                this.saveItem('course_chart'); //create new item
            }
        });

        $('#carditem-con-id-' + this.itemid).find('.carditem-close-but').click((e) => { //setup delete handler
            var c = e.currentTarget;
            if (confirm('Are you sure you want to remove this item?')) {
                this.deleteReadingItem();
            }
        });

        this.setItemsChangesListener();
        this.autoresizeDiv();
    }

    autoresizeDiv() {
        //creadits to the author: https://stephanwagner.me/auto-resizing-textarea
        $.each($('div[data-autoresize]'), function () {
            var offset = this.offsetHeight - this.clientHeight;

            var resizeDiv = function (el) {
                $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
            };
            $(this).on('keyup input', function () {
                resizeDiv(this);
            }).removeAttr('data-autoresize');
        });
    }

    setItemsChangesListener() {
        // select the target node
        //var target = document.querySelector('.items-container > ul');
        var target = $('#carditemid_' + this.itemid).find('.items-container > ul');
        //console.log(target[0]);

        // Callback function to execute when mutations are observed
        var callback = (mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'childList') {
                    console.log('A child node has been added or removed.');
                    this.confirmDisableReadingitemSortable();
                } else if (mutation.type == 'attributes') {
                    //console.log('The ' + mutation.attributeName + ' attribute was modified.');
                }
            });
        };

        // create an observer instance
        var observer = new MutationObserver(callback);

        // configuration of the observer:
        var config = {
            attributes: true,
            childList: true,
            characterData: true
        }

        // pass in the target node, as well as the observer options
        observer.observe(target[0], config);

        // later, you can stop observing
        //observer.disconnect();
    }

    //confirm disable sortable when items are empty
    confirmDisableReadingitemSortable() {
        var itemslength = $('#carditemid_' + this.itemid).find('.items-container > ul').children().length;
        //console.log('items length='+itemslength);

        if (parseInt(itemslength) <= 0) {
            $('#carditemid_' + this.itemid).find('div.items-container ul').sortable('disable'); //disable sortable 
            $('#carditemid_' + this.itemid).find('div.items-container ul').css({
                'background-color': 'white'
            });
            $('#carditemid_' + this.itemid).find('div.items-container ul li').css({
                'background-image': 'none',
                'cursor': 'text'
            });
            $('#carditemid_' + this.itemid).find('div.items-container ul li .editable').css({
                'cursor': 'text'
            });
            $('#carditem-con-id-' + this.itemid).find('.btn-sort-items').text('Sort items');
            $('#carditemid_' + this.itemid).find('div.sidebar ul li span').css({
                'cursor': 'pointer'
            });
            return;
        }
    }

    //This method is responsible for the sorting item feature 
    ReadingitemSortableManager() {

        $('#carditemid_' + this.itemid).find('div.items-container ul').sortable({ //this makes carditem items sortable
            update: (event, ui) => {
                //console.log(ui.item);
                //var cardid = $(ui.item).parents('.class-card').attr('id');
                //console.log(cardid);
                this.updatereadingitemslist(); //update list items in database when item changes the sort order
            }
        }).sortable('disable'); //temporary disable sortable    
    }

    getCarditemCount() {
        // select the target node
        var target = $('#cardid_' + this.cardid).find('.carditems-container');
        console.log(target[0].childElementCount);
        return target[0].childElementCount;
    }

    detachListeners() {

        this.orderedItemRef.off();

        for (let item of this.items) {
            this.itemRef.child('item-id-' + item.itemid).off();
            if (item.type == 'qa') {
                item.detachListeners();
            }
        }
    }

    deleteReadingItem() {
        firebase.database().ref('card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid).update({
                'isDeleted': true
            })
            .then(() => {
                this.showUndoSnackBar();
                console.log('Reading Item Deleted');
            }).catch((err) => {
                console.log(err);
            });
    }

    deleteAllItem() {

        var updates = {},
            items = $('#carditemid_' + this.itemid).find('.items-container ul').children();

        for (let i = 0; i < items.length; i++) {
            var item = $(items[i]).find('.item');
            var itemid = $(item[0]).attr('id');
            updates['item/' + this.theUser.uid + '/carditemid_' + this.itemid + '/' + itemid + '/isDeleted'] = true;
        };

        firebase.database().ref().update(updates)
            .then(() => {
                this.showUndoSnackBar2(items);
                console.log('Items Deleted');
            }).catch((err) => {
                console.log(err);
            });
    }

    //This method updates the items list sort order in database, we call this method when items changes the sort order
    updatereadingitemslist() {

        var updates = {},
            itemsidlist = [],
            items = $('#carditemid_' + this.itemid).find('div.items-container ul').children(); //get all items
        let modkey = (new Date()).getTime().toString(36); //creates new last modified key

        for (let b = 0; b < items.length; b++) {
            var item = $(items[b]).find('.item');
            var itemid = $(item[0]).attr('id');

            if (itemid) {
                sessionStorage.setItem(itemid, modkey);
                itemsidlist.push(itemid);
                updates['item/' + this.theUser.uid + '/carditemid_' + this.itemid + '/' + itemid + '/sort_order_no'] = modkey;
                updates['item/' + this.theUser.uid + '/carditemid_' + this.itemid + '/' + itemid + '/sort_order_no'] = b;
            }
        }

        updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/item_list'] = itemsidlist;

        firebase.database().ref().update(updates)
            .then(() => {
                console.log('Reading item list Updated succesfull!');
            }).catch((err) => {
                console.log(err);
                console.log("failed to update");
            });
    }

    showUndoSnackBar() {
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event) => {
            firebase.database().ref('card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid).update({
                    'isDeleted': false
                })
                .then(() => {}).catch((err) => {
                    console.log(err);
                });
        };

        var data = {
            message: 'Reading item deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    showUndoSnackBar2(items) {
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = () => {

            var updates = {};

            for (let i = 0; i < items.length; i++) {
                var item = $(items[i]).find('.item');
                var itemid = $(item[0]).attr('id');
                updates['item/' + this.theUser.uid + '/carditemid_' + this.itemid + '/' + itemid + '/isDeleted'] = false;
            };

            firebase.database().ref().update(updates)
                .then(() => {}).catch((err) => {
                    console.log(err);
                });
        };

        var data = {
            message: 'All items deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    saveItem(itemtype) {

        let iteminfo, itemid = (new Date()).getTime().toString(36); //creates new item id

        if (itemtype == 'qa') {
            iteminfo = {
                carditemid: 'carditemid_' + this.itemid,
                isDeleted: false,
                itemtype: itemtype,
                sort_order_no: this.items.length,
                correct_answers: [{
                    isDeleted: false,
                    textcontent: '',
                    message: ''
                }],
                question_options: [{
                    isDeleted: false,
                    textcontent: '',
                    message: ''
                }]
            };
        }else if (itemtype == 'course_chart') {
            iteminfo = {
                carditemid: 'carditemid_' + this.itemid,
                isDeleted: false,
                itemtype: itemtype,
                sort_order_no: this.items.length,
                chartData:[{
                    isDeleted: false,
                    textData : '',
                    textDataValue: ''
                }]
            };
        }
        else {
            iteminfo = {
                carditemid: 'carditemid_' + this.itemid,
                isDeleted: false,
                itemtype: itemtype,
                sort_order_no: this.items.length
            };
        }

        firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.itemid + '/item-id-' + itemid).set(iteminfo)
            .then(() => {
                console.log('Item saved');
                this.addreadinglistitem('item-id-' + itemid);
            }).catch((err) => {
                console.log(err);
            });
    }

    addreadinglistitem(itemid) {
        let Ref = 'card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/item_list/';
        firebase.database().ref(Ref)
            .once('value', (snap) => {

                firebase.database().ref(Ref + (snap.val() ? snap.val().length : 0)).set(itemid)
                    .then(() => {}).catch((err) => {
                        console.log(err);
                    });

            });

    }
}
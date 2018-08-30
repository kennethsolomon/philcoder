"use strict";

class YoutubeManager {
    constructor(theUser, carditemid, elementtype, id = null, orderno) {
        this.theUser = theUser;
        this.carditemid = carditemid; //also get the parent readinglist item id of this newly created item, we pass it through our constructor of this class
        this.itemid;
        this.type = elementtype;
        this.orderno = orderno;

        if (id) {
            this.itemid = id;
        } else {
            return;
        }
        this.youTube();
        var element = `<div id="item-id-${this.itemid}" class="item question_answer" data-type="${elementtype}">
                        <div class="question-menu-row">
                            <div class="question-col">
                                <div class="mdl-textfield mdl-js-textfield" style="width: 90%;">
                                    <!--<input class="mdl-textfield__input txtlink" type="text">-->
                                    <textarea class="mdl-textfield__input txtlink" rows="1" type="text" style="box-sizing: border-box; resize: none;" data-autoresize></textarea>
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">https://www.youtube.com/</label>
                                </div>
                            </div>
                        </div>
                      </div>`; //Initialize element 

        $('#carditemid_' + this.carditemid).find('.items-container > ul').append(`
                      <li style="order: ${this.orderno};">
                          <span class="item-close-but">
                              <i class="material-icons">close</i>
                          </span>
                          <div id="item-con-id-${this.itemid}" class="item-container">
                              ${element}
                          </div>
                      </li>
                  `);

        $('#item-id-' + this.itemid).focus();

        // @TODO make click events
        this.setEventHandlerListener();

        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('item-id-' + this.itemid));

    }
    setEventHandlerListener() {

        $('#item-id-' + this.itemid).parents('li').hover(function () {
            $(this).find('.item-close-but').css({
                'display': 'block'
            });
        }, function () {
            $(this).find('.item-close-but').css({
                'display': 'none'
            });
        });

        $('#item-id-' + this.itemid).parents('li').find('.item-close-but').click((e) => {
            var c = e.currentTarget;
            if (confirm('Delete this item?')) {
                $(c).parent().fadeOut('slow', (e) => {
                    $(c).parent().remove();
                    this.deleteItem();
                });
            }
        });
        $('#item-id-' + this.itemid).find('.txtlink').on('input', (e) => {
            this.saveItem('ytlink', $(e.currentTarget).val());
        });
    }
    deleteItem() {
        firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid).update({
                'isDeleted': true
            })
            .then(() => {
                this.showUndoSnackBar();
                // this.detachListeners();
                console.log('Item Deleted');
            }).catch((err) => {
                console.log(err);
            });
    }
    showUndoSnackBar() {
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event) => {
            firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid).update({
                    'isDeleted': false
                })
                .then(() => {}).catch((err) => {
                    console.log(err);
                });
        };

        var data = {
            message: 'Item deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
    setYTLink(intext) {
        $('#item-id-' + this.itemid).find('.txtlink').text(intext);
    }

    saveItem(fields, value) {

        let modkey = (new Date()).getTime().toString(36); //creates new last modified key
        sessionStorage.setItem('item-id-' + this.itemid, modkey);

        var updates = {};
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/last_modified_key/'] = modkey;
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/' + fields + '/'] = value;

        firebase.database().ref().update(updates)
            .then(() => {
                console.log('Item saved');
            }).catch((err) => {
                console.log(err);
            });
    }

    youTube() {
        let Ref = 'item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/ytlink';
        firebase.database().ref(Ref)
            .once('value', (snapshot) => {

                var youtubeLink = snapshot.val();

                youtubePlayer();

                // 
                function youtubePlayer() {
                    try {
                        var youtubeTemplate = "https://www.youtube.com/embed/";
                        var youtubeID = youtubeLink;
                        var getYoutubeID = youtubeID.substring(32, 43); // Get the 11 youtube ID, example : l4s33_L8Gzw
                        var ytlink = youtubeTemplate + getYoutubeID;
                        document.getElementById("ytlink").src = ytlink;
                    } catch (error) {
                        var error = console.log(error);
                        // `<div class="alert">
                        // <strong>Error!</strong> Please be sure to copy the exact <strong>YouTube</strong> URL.
                        // </div>`;
                        document.getElementById('error').innerHTML = error;
                    }
                }

            });

    }
}
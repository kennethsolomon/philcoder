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

                  $('#item-id-'+this.itemid).focus();

        // @TODO make click events
         this.setEventHandlerListener();

        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('item-id-'+this.itemid));


        var database = firebase.database();
        var setoptionChangeListener = (carditemid, itemid)=>{

            this.item_ytRef = database.ref('item/' + this.theUser.uid + '/carditemid_' + carditemid + '/item-id-' + itemid);
            this.item_ytRef.on('child_added', (data)=> {
                
                var id = data.key;
                var message = data.val().message;
                var textcontent = data.val().textcontent;
                var isDeleted = data.val().isDeleted;

                if(!isDeleted){
                    var option = new Option(this.theUser, this.carditemid, this.itemid, id);
                    option.setTextContent(textcontent);
                    option.setMsgContent(message);

                    this.options.push(option);

                    this.item_qoRef.child(id).on('child_changed', (data)=> {
                        var field = data.key;
                        var value = data.val();
                
                        if(field == 'isDeleted'){
                            $(`#quiz_option-${id}`)
                            .fadeOut('slow', ()=>{
                                this.item_caRef.child('quiz_option-'+id).off();
                                $(`#quiz_option-${id}`).remove();
                            });
                        }else if(field == 'textcontent'){
                            var my_mod_key = sessionStorage.getItem('quiz_option-'+id);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                              var last_modified_key = snap.val()
                              if(last_modified_key != my_mod_key){
                                $(`#quiz_option-${id}`).find('.txtoption').val(value);
                              }else{
                                //console.log('this');
                              }
                            });
                        }else if(field == 'message'){
                            var my_mod_key = sessionStorage.getItem('quiz_option-'+id);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                              var last_modified_key = snap.val()
                              if(last_modified_key != my_mod_key){
                                $(`#quiz_option-${id}`).find('.txtoption-msg').val(value);
                              }else{
                                //console.log('this');
                              }
                            });
                        }
                    });
                }

            });
        }
        setoptionChangeListener(this.carditemid, this.itemid);
    }
    setEventHandlerListener(){

        $('#item-id-'+this.itemid).parents('li').hover(function(){
            $(this).find('.item-close-but').css({'display':'block'});
        },function(){
            $(this).find('.item-close-but').css({'display':'none'});
        });

        $('#item-id-'+this.itemid).parents('li').find('.item-close-but').click((e)=>{
            var c = e.currentTarget;
            if(confirm('Delete this item?')){
                $(c).parent().fadeOut('slow', (e)=>{
                    $(c).parent().remove();
                    this.deleteItem();
                });
            }     
        });
    }
    deleteItem(){
        firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid).update({'isDeleted':true})
        .then(() => {   
            this.showUndoSnackBar();
           // this.detachListeners();
            console.log('Item Deleted');    
        }).catch((err)=>{
          console.log(err);  
        }); 
    }
    showUndoSnackBar(){
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event)=> {
            firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid).update({'isDeleted':false})
            .then(() => {   
            }).catch((err)=>{
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
    setYTLink(intext){
        $('#item-id-'+this.itemid).find('.txtlink').text(intext);
     }
}

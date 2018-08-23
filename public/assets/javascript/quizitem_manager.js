"use strict";
class QuizItemManager{
    constructor(theUser, carditemid,  elementtype, id=null, orderno){
        this.theUser = theUser;
        this.carditemid = carditemid;//also get the parent readinglist item id of this newly created quiz item, we pass it through our constructor of this class
        this.itemid;
        this.type = elementtype;
        this.answers = [];
        this.options = [];
        this.orderno = orderno;
        
        if(id){
            this.itemid = id;
        }else{
            return;
        }

        var element = `<div id="item-id-${this.itemid}" class="item question_answer" data-type="${elementtype}">
                        <div class="question-menu-row">
                            <div class="question-col">
                                <div class="mdl-textfield mdl-js-textfield" style="width: 90%;">
                                    <!--<input class="mdl-textfield__input txtquestion" type="text">-->
                                    <textarea class="mdl-textfield__input txtquestion" rows="1" type="text" style="box-sizing: border-box; resize: none;" data-autoresize></textarea>
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">question</label>
                                </div>
                            </div>
                            <div class="menu-col">     
                            </div>
                        </div>

                        <hr>

                        <div class="answer-row"> 
                            <!-- new answer appear here -->         
                        </div>
                        <div class="add-answer-row">
                            <button class="mdl-button mdl-js-button mdl-button--fab addanswer" style="outline: none; height: 30px; min-width: 30px; width: 30px; color: gray;">
                                <i class="material-icons">add</i>
                            </button>
                        </div>

                        <hr>

                        <div class="option-row">
                            <!-- new option appear here -->                                               
                        </div>  
                        <div class="add-option-row">
                            <button class="mdl-button mdl-js-button mdl-button--fab addoption" style="outline: none; height: 30px; min-width: 30px; width: 30px; color: gray;">
                                <i class="material-icons">add</i>
                            </button>
                        </div>     

                        <hr>            

                      </div>`;//Initialize element 

        $('#carditemid_'+this.carditemid).find('.items-container > ul').append(`
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

        this.setEventHandlerListener();
       
        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('item-id-'+this.itemid));

        var database = firebase.database();
        var setoptionChangeListener = (carditemid, itemid)=>{

            this.item_caRef = database.ref('item/' + this.theUser.uid + '/carditemid_' + carditemid + '/item-id-' + itemid + '/correct_answers/');
            this.item_caRef.on('child_added', (data)=> {
                
                var id = data.key;
                var message = data.val().message;
                var textcontent = data.val().textcontent;
                var isDeleted = data.val().isDeleted;

                if(!isDeleted){
                    var answer = new Answer(this.theUser, this.carditemid, this.itemid, id);
                    answer.setTextContent(textcontent);
                    answer.setMsgContent(message);

                    this.answers.push(answer);

                    this.item_caRef.child(id).on('child_changed', (data)=> {
                        var field = data.key;
                        var value = data.val();
                
                        if(field == 'isDeleted'){
                            $(`#quiz_answer-${id}`)
                            .fadeOut('slow', ()=>{
                                this.item_caRef.child('quiz_answer-'+id).off();
                                $(`#quiz_answer-${id}`).remove();
                            });
                        }else if(field == 'textcontent'){
                            var my_mod_key = sessionStorage.getItem('quiz_answer-'+id);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                              var last_modified_key = snap.val()
                              if(last_modified_key != my_mod_key){
                                $(`#quiz_answer-${id}`).find('.txtanswer').val(value);
                              }else{
                                //console.log('this');
                              }
                            });
                        }else if(field == 'message'){
                            var my_mod_key = sessionStorage.getItem('quiz_answer-'+id);
                            //console.log(my_mod_key);
                            data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                              var last_modified_key = snap.val()
                              if(last_modified_key != my_mod_key){
                                $(`#quiz_answer-${id}`).find('.txtanswer-msg').val(value);
                              }else{
                                //console.log('this');
                              }
                            });
                        }

                    });
                }
         
            });

            this.item_qoRef = database.ref('item/' + this.theUser.uid + '/carditemid_' + carditemid + '/item-id-' + itemid + '/question_options/');
            this.item_qoRef.on('child_added', (data)=> {
                
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

    readURL(input, preview_element_id) {
        if (input.files && input.files[0]) {
          var reader = new FileReader();
    
          reader.onload = function(e) {
            $('#'+preview_element_id).attr('src', e.target.result);
          }
         
          reader.readAsDataURL(input.files[0]);
        }
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

        $('#item-id-'+this.itemid).find('.addanswer').click(()=>{
            this.saveItemValue('correct_answers');
        });

        $('#item-id-'+this.itemid).find('.addoption').click(()=>{
            this.saveItemValue('question_options');
        });

        $('#item-id-'+this.itemid).find('.txtquestion').on('input', (e)=>{
            this.saveItem('text', $(e.currentTarget).val());
        });

        this.autoresizeTextarea();
        //this.setupUploadImageDialog();
    }

    setupUploadImageDialog(){
        var dialog = document.querySelector('#dialog-'+this.itemid);
        var showDialogButton = document.querySelector('#show-dialog-'+this.itemid);
        if (! dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        showDialogButton.addEventListener('click', function() {
            dialog.showModal();
        });
        dialog.querySelector('#dialog-'+this.itemid+' .close').addEventListener('click', function() {
            dialog.close();
        });
    }

    autoresizeTextarea(){
         //creadits to the author: https://stephanwagner.me/auto-resizing-textarea
        $.each($('textarea[data-autoresize]'), function() {
            var offset = this.offsetHeight - this.clientHeight;
         
            var resizeTextarea = function(el) {
                $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
            };
            $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
        });
    }

    setQuestion(intext){
        $('#item-id-'+this.itemid).find('.txtquestion').text(intext);
    }

    saveItem(fields, value){

        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
        sessionStorage.setItem('item-id-' + this.itemid, modkey);

        var updates = {};
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid + '/last_modified_key/'] = modkey;
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid + '/'+fields+'/'] = value;

        firebase.database().ref().update(updates)
        .then(() => {     
            console.log('Item saved');
        }).catch((err)=>{
            console.log(err);  
        });
    }

    saveItemValue(fieldType){

        let Ref = 'item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/'+fieldType+'/'; 
        firebase.database().ref(Ref)
            .once('value', (snap)=>{

                firebase.database().ref(Ref + (snap.val() ? snap.val().length : 0)).set({isDeleted: false})
                .then(() => {
                }).catch((err)=>{
                    console.log(err);
                });
            
            });
    }

    deleteItem(){
        
        firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid).update({'isDeleted':true})
        .then(() => {   
            this.showUndoSnackBar();
            this.detachListeners();
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
            message: 'Quiz item deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    detachListeners(){

        for(let answer of this.answers){
            this.item_caRef.child('quiz_answer-'+answer.id).off();
        }

        for(let option of this.options){
            this.item_caRef.child('quiz_option-'+option.id).off();
        }
    }
}
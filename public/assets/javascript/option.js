"use strict";
class Option{
    constructor(theUser, carditemid, quizitemid, id){
        this.theUser = theUser;
        this.carditemid = carditemid;
        this.itemid = quizitemid;
        this.id = id;

        if(!id){
            return;
        }

        var option =`<div id="quiz_option-${id}" class="answer-option-flex-cont" data-type="question_options">
                            <span class="answer-option-close">
                                <i class="material-icons">delete</i>
                            </span>
                            <div class="answer-option-col">
                                <div class="mdl-textfield mdl-js-textfield" style="width: 100%;">
                                    <input class="mdl-textfield__input txtoption" type="text">
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">option</label>
                                </div>
                            </div>
                            <div class="msg-col">
                                <div class="mdl-textfield mdl-js-textfield" style="width: 100%;">
                                    <textarea class="mdl-textfield__input txtoption-msg" rows="1" type="text"></textarea>
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">message</label>
                                </div>
                            </div>
                        </div>`;

        $(option).appendTo($('#item-id-'+this.itemid).find('.option-row')).hide().show('fadein');//apply fadein effects  
    
        this.setOptionClosedClickEventListener();
        //this.autoresizeTextarea();

        $(`#quiz_option-${id}`).find('.txtoption').on('input', (e)=>{
            this.saveinfo('textcontent', e.currentTarget.value);
        });

        $(`#quiz_option-${id}`).find('.txtoption-msg').on('input', (e)=>{
            this.saveinfo('message', e.currentTarget.value);
        });

        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('item-id-'+this.itemid));
    }

    setTextContent(text){
        $(`#quiz_option-${this.id}`).find('.txtoption').val(text);
    }

    setMsgContent(msg){
        $(`#quiz_option-${this.id}`).find('.txtoption-msg').val(msg);
    }

    setOptionClosedClickEventListener(){
        $('#item-id-'+this.itemid).find('.answer-option-close').click((e)=>{     
            this.deleteitem();
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

    deleteitem(){
    firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid + '/question_options/' + this.id).update({'isDeleted':true})
     .then(() => {   
         console.log('Deleted');    
     }).catch((err)=>{
       console.log(err);  
     });  
    }

    saveinfo(fields, value){

        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
        sessionStorage.setItem('quiz_answer-' + this.id, modkey);

        var updates = {};
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid + '/question_options/' + this.id + '/last_modified_key/'] = modkey;
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid +  '/item-id-' + this.itemid + '/question_options/' + this.id + '/' + fields + '/'] = value; 
 
        firebase.database().ref().update(updates)
        .then(() => {     
            console.log('Saved');
        }).catch((err)=>{
            console.log(err);  
        });
    }
}
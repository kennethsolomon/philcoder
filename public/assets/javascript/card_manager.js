"use strict";
class CardManager {
    constructor(theUser, sectionid, id = null, orderno) {
        this.theUser = theUser;
        this.sectionid = sectionid;
        this.cardid;
        this.cardItems = [];
        this.orderno = orderno;
        
        if(id){
            this.cardid = id;
        }else{
            return;
        }

        var cardelement = `
        <div id="cardid_${this.cardid}" class="class-card" style="order: ${this.orderno};">

                <div class="card-action-buttons">
                    <button class="btn btn-link card-close-but" id="cardbtndel${this.cardid}">
                        <i class="material-icons">delete</i>
                    </button><div class="mdl-tooltip mdl-tooltip--left" data-mdl-for="cardbtndel${this.cardid}">Delete</div> 
                    <button class="btn btn-link card-view-but" id="cardbtnv${this.cardid}">
                        <i class="material-icons">view_list</i>
                    </button><div class="mdl-tooltip mdl-tooltip--left" data-mdl-for="cardbtnv${this.cardid}">Grid View</div> 
                    <button class="btn btn-link card-sort-but" id="cardbtnsort${this.cardid}">
                        <i class="material-icons">sort</i>
                    </button><div class="mdl-tooltip mdl-tooltip--left" data-mdl-for="cardbtnsort${this.cardid}">Sort Items</div> 
                </div>

                <div class="card-panel">
                    <h5>title here..</h5>
                    <p>description here..</p>
                </div>

                <div class="elements-items-container">
                    <div class="eic-col-1">
                        <div class="elements-container">
                            <!-- display items here -->
                            Select items:                           
                                <ul>
                                    <li>
                                        <span class="btn-vid-thumbnail" style="cursor: pointer;">
                                            <i class="material-icons">video_library</i>
                                            Video
                                        </span>
                                    </li>
                                    <li>                                  
                                        <span class="btn-readinglist" style="cursor: pointer;">
                                            <i class="material-icons">description</i>
                                            Reading list
                                        </span>                                  
                                    </li>
                                </ul>                                                                                                                                                                                                                                     
                            </ul>   
                            <div class="btn-up">
                                <i class="material-icons">keyboard_arrow_up</i>
                            </div>                  
                        </div>
                    </div>          
                    <div class="eic-col-2">
                        <div class="card-title-des-row" style="display: flex; flex-flow: row wrap; padding-left: 23px;" justify-content: flex-start;>
                            <div style="padding-right: 5px;">
                                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
                                    <input class="mdl-textfield__input card_title" type="text">
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">card title</label>
                                </div>
                            </div>
                            <div style="padding: 0px;">
                                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
                                    <textarea class="mdl-textfield__input card_des" type="text" rows= "1" data-autoresize></textarea>
                                    <label class="mdl-textfield__label" for="sample5" style="margin-bottom: 0px;">card description</label>
                                </div>
                            </div>
                            <div style="padding-top: 20px;">
                                <button class="mdl-button mdl-js-button mdl-button--raised btn-add-item" style="text-transform: none; outline: none; padding-left: 5px; margin-left: 10px;">
                                    <span class="material-icons">add</span>
                                    Add Item
                                </button>
                            </div>
                        </div>

                        <div class="carditems-container">
                            
                        </div>
                    </div>                   
                </div>
            </div>
        `;
        $(cardelement).appendTo($('#sectionid_'+this.sectionid).find('.create-card-cont')).hide().show('clip');//apply clip effects 

         // This required to make the UI look correctly by Material Design Lite 
         componentHandler.upgradeElements(document.getElementById('cardid_'+this.cardid));

        $('#cardid_'+this.cardid).find('div.carditems-container').sortable({//this makes card items sortable
            update : (event, ui)=>{
              this.updatecarditemslist();
            }
        }).sortable('disable');//temporary disable sortable 

        //new VideoItemManager(this.theUser, this.sectionid, this.cardid, '1234');
        //return;
        
        this.setupEventHandlers();

        var database = firebase.database();
        var setcarditemChangeListener = (cardid)=>{

            this.carditemRef = database.ref('card_item/' + this.theUser.uid + '/cardid_' + cardid);
            this.orderedCarditemRef = database.ref('card_item/' + this.theUser.uid + '/cardid_' + cardid).orderByChild('sort_order_no');
      
            this.orderedCarditemRef.on('child_added', (data)=> {
              //var cardid = data.val().cardid;
              var carditemid = data.key;
              carditemid = carditemid.substring(11, carditemid.length);
              var type = data.val().type; 
              var isDeleted = data.val().isDeleted;
              var sort_order_no = data.val().sort_order_no;
        
              if(!isDeleted){
      
                if(type == 'videoitem'){
                  var videoitem = new VideoItemManager(this.theUser, cardid, carditemid, sort_order_no);//create new video item
                  videoitem.setTitle(data.val().title);
                  videoitem.setDescription(data.val().description);
                  videoitem.setUrl(data.val().downloadURL);
                  this.cardItems.push(videoitem);
                }else{
                  this.cardItems.push(new ReadingItemManager(this.theUser, cardid, carditemid, sort_order_no));//create new readinglist item
                }
        
                this.carditemRef.child('carditemid_'+carditemid).on('child_changed', (data)=> {
                  var field = data.key;
                  var value = data.val();
          
                  if(field == 'isDeleted'){
                    
                    if(value){

                        for(let i=0; i<this.cardItems.length; i++){
                            if(this.cardItems[i].itemid == carditemid){
                                if(this.cardItems[i].type == 'readinglist'){this.cardItems[i].detachListeners();}
                                $('#carditem-con-id-'+carditemid).hide('clip', ()=>{//apply clip effects before it removes
                                    $('#carditem-con-id-'+carditemid).remove();//removes the current card selected
                                });
                            }
                        }
      
                    }else{
                    
                      this.carditemRef.child('carditemid_'+carditemid).once('value', (snapcarditem) => {
                        let carditem;
                        var carditemid = snapcarditem.key;
                        carditemid = carditemid.substring(11, carditemid.length);
                        var carditemtype = snapcarditem.val().type;
                                 
                        if(carditemtype === 'videoitem'){
                          
                          var vtitle = snapcarditem.val().title;
                          var vdescription = snapcarditem.val().description;
                          var vname = snapcarditem.val().videoname;
                          var vurl = snapcarditem.val().downloadURL;
                  
                          carditem = new VideoItemManager(this.theUser, cardid, carditemid, snapcarditem.val().sort_order_no);
                          carditem.setTitle(vtitle);
                          carditem.setDescription(vdescription);
                          carditem.setUrl(vurl);
                  
                        }else{
                          
                          carditem = new ReadingItemManager(this.theUser, cardid, carditemid, snapcarditem.val().sort_order_no);
                  
                        } 

                        for(let i=0; i<this.cardItems.length; i++){
                            if(this.cardItems[i].itemid == carditemid){
                              this.cardItems[i] = carditem;
                            }
                        }
                       
                  
                      });

                    }
                 
                  }else if(field == 'title'){
                    var my_mod_key = sessionStorage.getItem('carditemid_'+carditemid);
                    //console.log(my_mod_key);
                    data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                      var last_modified_key = snap.val()
                      if(last_modified_key != my_mod_key){
                        $('#carditemid_'+carditemid).find('.carditem-vid-title').val(value);
                      }else{
                        //console.log('this');
                      }
                    });
                  }else if(field == 'description'){
                    var my_mod_key = sessionStorage.getItem('carditemid_'+carditemid);
                    //console.log(my_mod_key);
                    data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                      var last_modified_key = snap.val()
                      if(last_modified_key != my_mod_key){
                        $('#carditemid_'+carditemid).find('.carditem-vid-des').val(value);
                      }else{
                        //console.log('this');
                      }
                    });
                  }else if(field == 'downloadURL'){
                    var my_mod_key = sessionStorage.getItem('carditemid_'+carditemid);
                    console.log(my_mod_key);
                    data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                      var last_modified_key = snap.val()
                      if(last_modified_key != my_mod_key){
                        $('#video-'+carditemid).attr('src', value);
                      }else{
                        console.log('this');
                      }
                    });
                  }else if(field == 'sort_order_no'){
                    var my_mod_key = sessionStorage.getItem('carditemid_'+carditemid);
                    //console.log(my_mod_key);
                    data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                      var last_modified_key = snap.val()
                      if(last_modified_key != my_mod_key){
    
                        var carditem = document.getElementById(`carditem-con-id-${carditemid}`);
                        var carditem_container = carditem.parentElement;
                        carditem.remove();
                        
                        carditem.style.order = value;
                        carditem_container.insertBefore(carditem, carditem_container.childNodes[value+1]);
                        
                      }else{
                        //console.log('this');
                        document.getElementById(`carditem-con-id-${carditemid}`).style.order = value;
                      }
                    });
                    
                  }   
          
                });
          
              }
             
            });
        }
        setcarditemChangeListener(this.cardid);
    }

    setTitle(text){
        $('#cardid_'+this.cardid).find('.card_title').val(text);
    }

    setDescription(text){
        $('#cardid_'+this.cardid).find('.card_des').val(text);
    }

    setupButtonsEventHandlers(){
        let cardid = this.cardid;
        $('#cardid_'+cardid).find('.btn-add-item').click((e)=>{//add item button click event handlers
            var c = e.currentTarget;//get the add item node object
            $('#cardid_'+cardid).find(".eic-col-1").slideDown('slow', ()=>{
                //c.innerHTML === 'Add Item' ? c.innerHTML = '<i class="material-icons">keyboard_arrow_up</i>' : c.innerHTML = 'Add Item';//dynamically change the button text node after toggle event
                c.style.display = "none";
            });
            return;
        });

        $('#cardid_'+cardid).find('.btn-up').click((e)=>{//
            $('#cardid_'+cardid).find(".eic-col-1").slideUp('slow', ()=>{
                $('#cardid_'+cardid).find('.btn-add-item').css({'display':'block'});
            });
            return;
        });

        $('#cardid_'+cardid).find('.btn-vid-thumbnail').click((e)=>{//video display click event handlers
            $('#cardid_'+cardid).find(".eic-col-1").slideUp('slow', ()=>{
                $('#cardid_'+cardid).find('.btn-add-item').css({'display':'block'});
            });

            this.savecarditeminfo('videoitem');
            return;
        });

        $('#cardid_'+cardid).find('.btn-readinglist').click((e)=>{//reading list display click event handlers
            $('#cardid_'+cardid).find(".eic-col-1").slideUp('slow', ()=>{
                $('#cardid_'+cardid).find('.btn-add-item').css({'display':'block'});
            });

            this.savecarditeminfo('readinglist');
            return;
        });

        $('#cardid_'+cardid).find('.card-close-but').click((e)=>{//set up close button event handler
            var c = e.currentTarget;
            if(confirm('Are you sure you want to remove this card?')){         
                this.deleteCard();             
            }
            return;
        });

        $('#cardid_'+cardid).find('.card-view-but').click((e)=>{//set up view button event handler       
            var c = e.currentTarget; 

            let id = this.cardid;

            if(c.firstElementChild.textContent === 'view_list'){
                this.setcardlistTitleDes('#cardid_'+id);

                $('#cardid_'+id).css({'height':'80px'});//sets all cards height to max-content
                $('#cardid_'+id).find('.elements-items-container').css({'display':'none'});//Hides all cards contents
                $('#cardid_'+id).find('.card-panel').css({'display':'block'});//Displays the cards panel for listview

                c.firstElementChild.textContent = 'view_module';//changes the button icon to large view

            }else{
                $('#cardid_'+id).css({'height':'auto'});//sets all cards height to 350 pixels (default)
                $('#cardid_'+id).find('.elements-items-container').css({'display':'block'});//Displays all cards contents
                $('#cardid_'+id).find('.card-panel').css({'display':'none'});//Hides the cards panel

                c.firstElementChild.textContent = 'view_list';//changes the button icon to list view

            }
            this.cardeffect('#cardid_'+id);
            return;
        });

        $('#cardid_'+cardid).find('.card-sort-but').click((e)=>{//set up view button event handler       
            var c = e.currentTarget; 

            let id = this.cardid;

            if(c.firstElementChild.textContent === 'sort'){

                c.firstElementChild.textContent = 'done_all';//changes the sort carditem button icon to done_all
                c.nextElementSibling.textContent = 'Done';//makes this button tooltip text to "Done" 

                $('#cardid_'+cardid).find('.btn-add-item')
                .attr('disabled','true');
                
                this.setcarditemssView('list');

                $('#cardid_'+this.cardid).find('div.carditems-container')
                .css({'display':'block'})
                .sortable('enable')//ofcourse enable the sortable feature
                .sortable({
                    //connectWith: ".carditems-container",
                    start: function(e, ui){
                        ui.placeholder.height(ui.item.height());
                    }
                });

            }else{

                c.firstElementChild.textContent = 'sort';//changes the button icon to list view
                c.nextElementSibling.textContent = 'Sort Items';//makes this button tooltip text to "Sort cards" 

                $('#cardid_'+cardid).find('.btn-add-item')
                .removeAttr('disabled');
                
                this.setcarditemssView('grid');

                $('#cardid_'+this.cardid).find('div.carditems-container')
                .css({'display':'flex'})
                .sortable('disable');//disable sortable

            }
            //this.cardeffect('#cardid_'+id);
            return;
        });
    }

    setupEventHandlers(){
        $('#cardid_'+this.cardid).find('.card_title').on('input',(e)=>{         
            this.savecardinfo('title', $(e.currentTarget).val());
        });

        $('#cardid_'+this.cardid).find('.card_des').on('input',(e)=>{        
            this.savecardinfo('description', $(e.currentTarget).val());
        });

        this.setupButtonsEventHandlers();
    }

    setcardlistTitleDes(cardid){

          let card_title = $(cardid).find('.card_title').val();//card title
          let card_des = $(cardid).find('.card_des').val();//card description
    
          var elements = $(cardid).find('.card-panel').children();//get reference to card panel h5(title) and p(description)
    
          elements[0].textContent = card_title;//set title to h5 tag
          elements[1].textContent = card_des.substring(0, 40) + '...';//set description to paragraph tag
    
          if(!card_title){
            elements[0].textContent = 'Card title here..';//set empty title to h5 tag
          }
          if(!card_des){
            elements[1].textContent = 'Card description here..';//set empty description to paragraph tag
          }
    }

    cardeffect(cardid){
        $(cardid).hide().show('clip');//apply clip effects 
    }

    setcarditemssView(viewtype){
        var carditems = $('#cardid_'+this.cardid).find('.carditems-container').children();//get all card items
        if(viewtype == 'list'){
            for(let i=0; i < carditems.length; i++){

                $(carditems[i]).css({'height':'70px','cursor':'move'});//sets all card items height to max-content and sets card item cursor to move
                $(carditems[i]).find('.carditem-panel').css({'display':'block'});//Displays the card items panel for listview
                var carditem_type = $(carditems[i]).find('.carditem').attr('data-type');

                if(carditem_type == 'videoitem'){
                    $(carditems[i]).find('.carditem').css({'visibility':'hidden' ,'overflow':'hidden'});//Hides all card items contents
                    let carditem_title = $(carditems[i]).find('.carditem-vid-title').val();//card item title
                    let carditem_des = $(carditems[i]).find('.carditem-vid-des').val();//card item description
                
                    var elements = $(carditems[i]).find('.carditem-panel').children();//get reference to card item panel h5(title) and p(description)
                
                    $(elements[0]).text(carditem_title);//set title to h5 tag
                    $(elements[1]).text(carditem_des.substring(0, 40) + '...');//set description to paragraph tag
                
                    if(!carditem_title){
                        $(elements[0]).text('title here..');//set empty title to h5 tag
                    }
                    if(!carditem_des){
                        $(elements[1]).text('description here..');//set empty description to paragraph tag
                    }
                }else{
                    $(carditems[i]).find('.carditem').css({'visibility':'hidden'});//Hides all card items contents
                    var elements = $(carditems[i]).find('.carditem-panel').children();//get reference to card item panel h5(title) and p(description)
                    $(elements[0]).text('Reading list item');//set title to h5 tag
                    $(elements[1]).text('Reading list item');//set description to paragraph tag
                }
                 
            }
        }else{
            for(let i=0; i < carditems.length; i++){
                $(carditems[i]).css({'height':'auto', 'cursor':'default'})//sets card item height to auto and sets card item cursor to default
                $(carditems[i]).find('.carditem-panel').css({'display':'none'});//Hides the card items panel
                $(carditems[i]).find('.carditem').css({'visibility':'visible', 'overflow':'hidden'});//Displays all card items contents
            }
        }       
    }

    savecardinfo(fields, value){

        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
        sessionStorage.setItem('cardid_' + this.cardid, modkey);

        var updates = {}
        updates['card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid + '/last_modified_key/'] = modkey;
        updates['card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid + '/'+fields] = value;
        firebase.database().ref().update(updates)
        .then(() => {   
            console.log('Card saved');
        }).catch((err)=>{
          console.log(err);  
        });
    }

    detachListeners(){
        
        this.orderedCarditemRef.off();
        for(let carditem of this.cardItems){
            this.carditemRef.child('carditemid_'+carditem.itemid).off();
            if(carditem.type == 'readinglist'){
                carditem.detachListeners();
            }                  
        }
    }

    deleteCard(){
        firebase.database().ref('card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid).update({'isDeleted':true})
        .then(() => {   
            this.showUndoSnackBar();
            console.log('Card Deleted');       
        }).catch((err)=>{
          console.log(err);  
        }); 
    }

    showUndoSnackBar(){
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event)=> {
            firebase.database().ref('card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid).update({'isDeleted':false})
            .then(() => {   
            }).catch((err)=>{
                console.log(err);  
            }); 
        };

        var data = {
            message: 'Card deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    updatecarditemslist(){

        var updates = {}, carditemsidlist = [], carditems = $('#cardid_'+this.cardid).find('div.carditems-container').children();//get all card items
        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
      
        for(let e=0; e < carditems.length; e++){
            var span_closed_but = carditems[e].firstElementChild;
            var span_drag_but = span_closed_but.nextElementSibling;
            var panel = span_drag_but.nextElementSibling;
            var item_el = panel.nextElementSibling;
            var carditemid = item_el.getAttribute('id');

            sessionStorage.setItem(carditemid, modkey);
                
            carditemsidlist.push(carditemid);
            updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/' + carditemid + '/last_modified_key'] = modkey;   
            updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/' + carditemid + '/sort_order_no'] = e;      
        }

        updates['card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid + '/item_list'] = carditemsidlist;      
           
        firebase.database().ref().update(updates)
        .then(() => {
            console.log('Card item list Updated');
        }).catch((err)=>{
            console.log(err);
        });
    }

    /* Save card item */
    savecarditeminfo(itemtype){
        let type, carditeminfo = {}, carditemid = (new Date()).getTime().toString(36);//creates new card id

        if(itemtype == 'videoitem'){
           
            carditeminfo = {
                cardid: 'cardid_' + this.cardid,
                isDeleted: false,
                type: itemtype,
                sort_order_no: this.cardItems.length,
                title: '',
                description: '',
                downloadURL: ''
            };
        }else{
           
            carditeminfo = {
                cardid: 'cardid_' + this.cardid,
                isDeleted: false,
                type: itemtype,
                sort_order_no: this.cardItems.length
            };
        }
        
        firebase.database().ref('card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + carditemid).set(carditeminfo)
        .then(() => {   
            console.log('Card item saved');
            this.addcarditem('carditemid_' + carditemid);
        }).catch((err)=>{
        console.log(err);  
        });
    }

    addcarditem(carditemid){
        let Ref = 'card/' + this.theUser.uid + '/sectionid_' + this.sectionid + '/cardid_' + this.cardid + '/item_list/';
        firebase.database().ref(Ref)
        .once('value', (snap)=>{
    
          firebase.database().ref(Ref + (snap.val() ? snap.val().length : 0)).set(carditemid)
          .then(() => {
          }).catch((err)=>{
            console.log(err);
          });
    
        });
    
    }

}


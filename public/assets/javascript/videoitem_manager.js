"use strict";
class VideoItemManager{
    constructor(theUser, cardid, id = null, orderno){
        this.theUser = theUser;
        this.cardid = cardid;//also get the parent card id of this newly created reading list item, we pass it through our constructor of this class
        this.itemid;
        this.type = 'videoitem';
        this.uploadtask;
        this.orderno = orderno;

        if(id){
            this.itemid = id;
        }else{
            return;
        }

        var element = `
                <div id="carditemid_${this.itemid}" class="carditem videoitem" data-type="videoitem">
                    <div class="vid-col-1">
                        <video id="video-${this.itemid}" width="100%" height="max-content" src="#" controls>
                        </video>
                        <div class="progress" style="height: 3px;">
                            <div id="videoitem-progressbar-${this.itemid}" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    <div class="vid-col-2">
                        <form action="#" style="padding: 10px;">
                            <div class="custom-file">
                                <input type="file" class="custom-file-input videoitem-input-vid">
                                <label class="custom-file-label" for="customFile">Choose file</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield" style="width: 100%; margin: 0px;">
                                <input class="mdl-textfield__input carditem-vid-title" type="text">
                                <label class="mdl-textfield__label" for="sample1" style="margin-bottom: 0px">Title...</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield" style="width: 100%; margin: 0px;">
                                <textarea class="mdl-textfield__input carditem-vid-des" type="text" rows= "3"></textarea>
                                <label class="mdl-textfield__label" for="sample5" style="margin-bottom: 0px">Description...</label>
                            </div>
                        </form>
                    </div>
               </div>`;

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
        
        $(carditem).appendTo($('#cardid_'+this.cardid).find('.carditems-container')).hide().show('clip');//apply clip effects 

        //return;
        
        this.setupEventHandlers();

        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('carditem-con-id-'+this.itemid));
    }

    setupEventHandlers(){

        $('#carditem-con-id-'+this.itemid).find(".videoitem-input-vid").change((e)=> {
            this.readURL(e.currentTarget, "video-"+this.itemid);
            if(this.uploadtask){
                this.uploadtask.cancel();
            }       
            this.uploadvideo();
        });

        $('#carditem-con-id-'+this.itemid).find(".carditem-vid-title").on('input',(e)=> {
            this.savevideoiteminfo('title', $(e.currentTarget).val());
        });

        $('#carditem-con-id-'+this.itemid).find(".carditem-vid-des").on('input',(e)=> {
            this.savevideoiteminfo('description', $(e.currentTarget).val());
        });

        $('#carditem-con-id-'+this.itemid).find('.carditem-close-but').click((e)=>{//setup delete handler
            var c = e.currentTarget;
            if(confirm('Are you sure you want to remove this item?')){               
                this.deleteVideoItem();              
            }
        });
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

    setUrl(url){
        $('#video-'+this.itemid).attr('src', url);
    }

    setTitle(title){
        $('#carditemid_'+this.itemid).find('.carditem-vid-title').val(title);
    }

    setDescription(description){
        $('#carditemid_'+this.itemid).find('.carditem-vid-des').text(description);
    }

    uploadvideofile(videofile, callback){
    
        let filename = videofile.name;
        let lastIdx = filename.lastIndexOf(".");
    
        let extension = "";
        if (lastIdx > 0) {
          extension = filename.substr(lastIdx);
        }
    
        let newFilename = this.itemid + extension;

        var progressbar = document.getElementById('videoitem-progressbar-'+this.itemid), upload_percentage, percentage;
    
        //get file
        var videofile = videofile;
        // Create the file metadata
        var metadata = {
          contentType: 'video/mp4'
        };
        // Points to the root reference
        var storageRef = firebase.storage().ref('carditems_video/'+this.theUser.uid+'/'+newFilename);
        // File name 
        var videoname = storageRef.name
        //Upload file
        this.uploadtask = storageRef.put(videofile, metadata);
        //update progress bar
        this.uploadtask.on('state_changed',
          (snapshot) =>{
            upload_percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            percentage = Math.round(upload_percentage);
            progressbar.style.width = percentage + '%';
            progressbar.setAttribute('aria-valuenow', percentage);
          },
          (err) =>{
            console.log(err);
          },
          ()=>{
            // Upload completed successfully, now we can get the download URL
            this.uploadtask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              //console.log('Video file available at', downloadURL);
              callback(downloadURL,videoname);
            });
          }
        );
    }

    savevideoiteminfo(fields, value){

        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
        sessionStorage.setItem('carditemid_' + this.itemid, modkey);

        var updates = {}
        updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/last_modified_key/'] = modkey;
        updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/'+fields] = value;
        firebase.database().ref().update(updates)
        .then(() => {     
            console.log('Video Item saved');
        }).catch((err)=>{
            console.log(err);  
        });

    }

    deleteVideoItem(){     
        firebase.database().ref('card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid).update({'isDeleted':true})
        .then(() => {   
            console.log('Video Item Deleted');
            this.showUndoSnackBar();
        }).catch((err)=>{
          console.log(err);  
        }); 
    }

    uploadvideo(){

        let modkey = (new Date()).getTime().toString(36);//creates new last modified key
        sessionStorage.setItem('carditemid_' + this.itemid, modkey);

        var updates = {};

        var vidinput = $('#carditemid_'+this.itemid).find('.videoitem-input-vid');
        const videofile = vidinput[0].files[0];
        this.uploadvideofile(videofile,(downloadURL,videoname)=>{

            updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/last_modified_key/'] = modkey;
            updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/downloadURL/'] = downloadURL;
            updates['card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid + '/videoname/'] = videoname;
            
            firebase.database().ref().update(updates)
            .then(() => {   
                console.log('Video Uploaded');
            }).catch((err)=>{
                console.log(err);  
            });
        });
    }

    showUndoSnackBar(){
        var snackbarContainer = document.querySelector('.mdl-snackbar');

        var handler = (event)=> {
            firebase.database().ref('card_item/' + this.theUser.uid + '/cardid_' + this.cardid + '/carditemid_' + this.itemid).update({'isDeleted':false})
            .then(() => {   
            }).catch((err)=>{
                console.log(err);  
            }); 
        };

        var data = {
            message: 'Video item deleted',
            timeout: 3000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
}
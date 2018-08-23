"use strict";

class ClassManager {
  constructor(theUser, courseid, id) {
    this.theUser = theUser;
    this.courseid = courseid;
    this.classid;
    this.sectionCount = 0;
    this.sections = [];
    this.uploadtask;
    this.classRef;

    if(id){
      this.classid = id.substring(8, id.length);
      this.classRef = firebase.database().ref('class/' + this.theUser.uid);
      this.classRef.child('classid_'+this.classid).once('value', (snapclass) => {

        var classid = snapclass.key; 
        var classe = snapclass.val();

        //var class_cardidlist = snapclass.val().card_list;
        $('.action_title').text('Update Class');

        if(classe){

          $('#txtclasstitle').val(classe.title);
          $('#txtclassdes').val(classe.description);
          $('#class-img-prev-elid').attr('src', classe.image_url).parent('.prev-cont').css("display","block");

        }
        
      });  
    }else{
      //creates new class id
      let genclassid = (new Date()).getTime().toString(36);
      this.classid = genclassid;//Initialize class id
      setTimeout(()=>{
        this.saveclassinfo('','', true);
      }, 1000);  
      this.savesectioninfo();//display one section
    }

    $('.class-form').attr('id','classid_'+this.classid);

    this.setClassFormInputEventHandlers();
    this.setFloatingMenuButtonEventHandlers();
    this.autoresizeTextarea();
    this.setSectionsCount();

    $('.create-section-cont').sortable({//this makes class sections sortable
      update : (event, ui)=>{
        var i = 0, section = ui.item[0];
        //while( (section = section.previousElementSibling != null)){
        //  i++;
        //}
        //section.style.order = i;
        this.updateclasssectionlist();
      }
    });
    $('.create-section-cont').sortable({
      forcePlaceholderSize: true
    });
    $('.create-section-cont').sortable('disable');//disable sortable

    var database = firebase.database();
    this.classRef = firebase.database().ref('class/'+this.theUser.uid);

    var setsectionChangeListener = (classid)=> {
      
      let sectionRef = database.ref('section/' + this.theUser.uid + '/classid_' + classid);
      let orderedSecRef = database.ref('section/' + this.theUser.uid + '/classid_' + classid).orderByChild('sort_order_no');

      orderedSecRef.on('child_added', (data)=> {
        //var classid = data.val().classid;
        var sectionid = data.key;
        sectionid = sectionid.substring(10, sectionid.length);
        var isDeleted = data.val().isDeleted;
        var sort_order_no = data.val().sort_order_no;
  
        if(!isDeleted){
  
          var section = new SectionManager(this.theUser, classid, sectionid, sort_order_no);
          section.setlabel(data.val().label);    

          this.sections.push(section);
    
          sectionRef.child('sectionid_'+sectionid).on('child_changed', (data)=> {
            var field = data.key;
            var value = data.val();
    
            if(field == 'isDeleted'){
              
              if(value){
                
                  for(let i=0; i<this.sections.length; i++){
                    if(this.sections[i].sectionid == sectionid){
                      this.sections[i].detachListeners();
                      $('#sectionid_'+sectionid).hide('fade', ()=>{
                        $('#sectionid_'+sectionid).remove(); 
                      });
                    }
                  }
               
              }else{
              
                sectionRef.child('sectionid_'+sectionid).once('value', (snapsec) => {
                  var sectionid = snapsec.key;
                  sectionid = sectionid.substring(10, sectionid.length);
                        
                  var section = new SectionManager(this.theUser, classid, sectionid, snapsec.val().sort_order_no);            
                  section.setlabel(snapsec.val().label);

                  for(let i=0; i<this.sections.length; i++){
                    if(this.sections[i].sectionid == sectionid){
                      this.sections[i] = section;
                    }
                  }
                   
                });

              }
           
            }else if(field == 'label'){
              var my_mod_key = sessionStorage.getItem('sectionid_'+sectionid);
              //console.log(my_mod_key);
              data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                var last_modified_key = snap.val()
                if(last_modified_key != my_mod_key){
                  $(`#sectionlabel${sectionid}`).text(value);
                }else{
                  //console.log('this');
                }
              });
            }else if(field == 'sort_order_no'){
              var my_mod_key = sessionStorage.getItem('sectionid_'+sectionid);
              //console.log(my_mod_key);
              data.ref.parent.child('last_modified_key').once('value', (snap)=>{
                var last_modified_key = snap.val()
                if(last_modified_key != my_mod_key){

                  var section = document.getElementById(`sectionid_${sectionid}`);
                  var sec_container = section.parentElement;
                  section.remove();
                  
                  sec_container.insertBefore(section, sec_container.childNodes[value+1]);
                  section.style.order = value;

                }else{
                  //console.log('this');
                  document.getElementById(`sectionid_${sectionid}`).style.order = value;
                }
              });
              
            }
    
          });
    
        }
       
      });
    }
    setsectionChangeListener(this.classid);

    this.classRef.child('classid_'+this.classid).on('child_changed', (data)=> {

      var field = data.key;
      var value = data.val();
      
      if(field == 'isDeleted'){

      }else if(field == 'title'){
        var my_mod_key = sessionStorage.getItem('classid_'+this.classid);
        //console.log(my_mod_key);
        data.ref.parent.child('last_modified_key').once('value', (snap)=>{
          var last_modified_key = snap.val()
          if(last_modified_key != my_mod_key){
            document.getElementById("txtclasstitle").value = value;
          }else{
            //console.log('this');
          }
        });
      }else if(field == 'description'){
        var my_mod_key = sessionStorage.getItem('classid_'+this.classid);
        //console.log(my_mod_key);
        data.ref.parent.child('last_modified_key').once('value', (snap)=>{
          var last_modified_key = snap.val()
          if(last_modified_key != my_mod_key){
            document.getElementById("txtclassdes").value = value;
          }else{
            //console.log('this');
          }
        });
      }else if(field == 'image_url'){
        var my_mod_key = sessionStorage.getItem('classid_'+this.classid);
        //console.log(my_mod_key);
        data.ref.parent.child('last_modified_key').once('value', (snap)=>{
          var last_modified_key = snap.val()
          if(last_modified_key != my_mod_key){
            $('#class-img-prev-elid').attr('src', value).parent('.prev-cont').css("display","block");
          }else{
            //console.log('this');
          }
        });
      }
  
    });
  
  }

  setClassFormInputEventHandlers(){

    $('.btnsubmitclass').one("click", () =>{
      alert('We are still working on it');
    });

    $("#class-input-img").change((e)=> {
      this.readURL(e.currentTarget, "class-img-prev-elid");
      if(this.uploadtask){
        this.uploadtask.cancel();
      }
      this.uploadclassimage();
    });

    var txtclasstitle = document.getElementById("txtclasstitle"), 
        txtclassdes = document.getElementById("txtclassdes");

    txtclasstitle.addEventListener("input", (e)=>{
      this.saveclassinfo('title', $(e.currentTarget).val());
    });

    //$('#txtclasstitle').on('input',(e)=>{
    //  this.saveclassinfo('title', $(e.currentTarget).val());
    //});

    txtclassdes.addEventListener("input", (e)=>{
      this.saveclassinfo('description', $(e.currentTarget).val());
    });
  }

  setFloatingMenuButtonEventHandlers(){
   
    $('.btn-add-section').click((e)=>{
      this.savesectioninfo();
    });

    $('.sortsec').click((e)=>{
      var c = e.currentTarget;

      if(c.firstElementChild.textContent === 'sort'){

        c.firstElementChild.textContent = 'done_all';//changes the sort section button icon to done_all
        c.setAttribute('data-original-title','Done sort');//makes this sort section button tooltip text to "Done sort"

        $(".create-section-cont").css({'background-color':'rgb(230, 226, 226)'});
        $('.class-section').css({'cursor':'move'});//sets all cards height to max-content
        $('.collapse').collapse('hide')
        $('.sectionlabel').css({'pointer-events':'none'});
        $('.editlabel').attr('disabled','true');
        $('.btn-add-section').css({'cursor':'not-allowed'})
        .attr('disabled','true');

        $( ".create-section-cont" )
        .css({'display':'block'})
        .sortable('enable')//ofcourse enable the sortable feature
        .sortable({
            connectWith: ".create-section-cont",
            start: function(e, ui){
                ui.placeholder.height(ui.item.height());
            }
        });

      }else{

        c.firstElementChild.textContent = 'sort';//changes the button icon to list view
        c.setAttribute('data-original-title','Sort sections');//makes this button tooltip text to "List view"

        $(".create-section-cont").css({'background-color':'white'});
        $('.class-section').css({'cursor':'default'});//sets all cards cursor to default
        $('.sectionlabel').css({'pointer-events':'auto'});
        $('.editlabel').removeAttr('disabled');
        $('.btn-add-section').css({'cursor':'pointer'})
        .removeAttr('disabled');

        $( ".create-section-cont" )
        .css({'display':'flex'})
        .sortable('disable');//disable sortable

      }

      $("[data-toggle='tooltip']").tooltip('hide');//this makes tooltip refresh its text content
    
    });
  }

  readURL(input, preview_element_id) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        $('#'+preview_element_id).attr('src', e.target.result).parent('.prev-cont').css("display","block");
      }
     
      reader.readAsDataURL(input.files[0]);
    }
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

  setSectionsCount(){
    // select the target node
    var target = document.querySelector('.create-section-cont');

    // Callback function to execute when mutations are observed
    var callback = (mutations)=> {
        mutations.forEach((mutation)=> {
            if (mutation.type == 'childList') {
                //console.log('A child node has been added or removed.');
                this.sectionCount = mutation.target.childElementCount;              
            }
            else if (mutation.type == 'attributes') {
                //console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        });
    };
    
    // create an observer instance
    var observer = new MutationObserver(callback);
    
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true }
    
    // pass in the target node, as well as the observer options
    observer.observe(target, config);
    
    // later, you can stop observing
    //observer.disconnect();
  }

  /* Upload */
  uploadimagefile(imagefile, callback){ 

    let filename = imagefile.name;
    let lastIdx = filename.lastIndexOf(".");

    let extension = "";
    if (lastIdx > 0) {
      extension = filename.substr(lastIdx);
    }

    let newFilename = 'classid_'+this.classid + extension;

    var progressbar = document.getElementById('p1'), class_img_upload_percentage, percentage;

    //get file
    var imagefile = imagefile;
    // Create the file metadata
    var metadata = {
      contentType: 'image/jpeg'
    };
    // Points to the root reference
    var storageRef = firebase.storage().ref('class_images/'+this.theUser.uid+'/'+newFilename);
    // File name 
    var imagename = storageRef.name
    //Upload file
    this.uploadtask = storageRef.put(imagefile, metadata);
    //update progress bar
    this.uploadtask.on('state_changed',
      (snapshot) =>{
        class_img_upload_percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        percentage = Math.round(class_img_upload_percentage);
        progressbar.style.width = percentage + '%';
        progressbar.setAttribute('aria-valuenow', percentage);
      },
      (err) =>{
        console.log(err);
      },
      ()=>{
        // Upload completed successfully, now we can get the download URL
        this.uploadtask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          callback(downloadURL,imagename);
        });
      }
    );
  }

  deletefile(dir, filename){
    // Create a reference to the file to delete
    var fileRef = firebase.storage().ref(dir+'/' + this.theUser.uid + '/' +filename);

    // Delete the file
    fileRef.delete().then(function() {
      // File deleted successfully
    }).catch(function(error) {
      // Uh-oh, an error occurred!
      console.log(error);
    });
  }
  /* Upload */

  /* Updates Functions  */
  saveclassinfo(field, value, isInit = false){

    var updates = {};
    
    let modkey = (new Date()).getTime().toString(36);//creates new last modified key
    sessionStorage.setItem('classid_' + this.classid, modkey);

    if(isInit){
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/course_id/'] = this.courseid;
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/last_modified_key/'] = modkey;
      updates['course/' + this.theUser.uid + '/' + this.courseid + '/class_list/' + 'classid_'+this.classid + '/'] = 'classid_'+this.classid;
    }else{
      //initialize class data to be save
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/last_modified_key/'] = modkey;
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/'+field+'/'] = value;
    }

    firebase.database().ref().update(updates)
    .then(() => {     
      console.log('class saved');
    }).catch((err)=>{
      console.log(err);  
    });
  }

  uploadclassimage(){

    //Upload course image first
    //get image
    const imagefile = document.querySelector('#class-input-img').files[0];
    this.uploadimagefile(imagefile, (imageurl,imagename)=>{
      if(imageurl === null){//cancel this operation when upload image failed
        return;
      }

      var updates = {};

      let modkey = (new Date()).getTime().toString(36);//creates new last modified key
      sessionStorage.setItem('classid_' + this.classid, modkey);

      //initialize class data to be save
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/last_modified_key/'] = modkey;
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/image_url/'] = imageurl;
      updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/image_name/'] = imagename;

      firebase.database().ref().update(updates)
      .then(() => {    
        console.log('class image saved'); 
      }).catch((err)=>{
        console.log(err);  
      });
    });
  }

  updateclasssectionlist(){

    var updates = {}, sectionidlist = [], sections = $('.create-section-cont').children();//get all sections

    let modkey = (new Date()).getTime().toString(36);//creates new last modified key
     
    for(let d=0; d < sections.length; d++){
      let sectionid = sections[d].getAttribute('id');
      sessionStorage.setItem(sectionid , modkey);
        
      sectionidlist.push(sectionid);//it collect all of the section id 
      updates['section/' + this.theUser.uid + '/classid_' + this.classid + '/' + sectionid + '/last_modified_key'] = modkey;
      updates['section/' + this.theUser.uid + '/classid_' + this.classid + '/' + sectionid + '/sort_order_no'] = d;
    }

    updates['class/' + this.theUser.uid + '/classid_' + this.classid + '/section_list'] = sectionidlist;

    firebase.database().ref().update(updates)
    .then(() => {
      console.log('Class section list Updated');
    }).catch((err)=>{
      console.log(err);
      console.log("failed to update");
    });
  }
  /* Updates Functions  */

  /* Save section */
  savesectioninfo(){

    let sectionid = (new Date()).getTime().toString(36);//creates new section id

    let modkey = (new Date()).getTime().toString(36);//creates new last modified key
    sessionStorage.setItem('sectionid_' + sectionid, modkey);

    var sectioninfo = {
      classid: 'classid_'+this.classid,
      isDeleted: false,
      sort_order_no: this.sections.length,
      last_modified_key: modkey,
      label: 'Section no. ' + this.sections.length
    };
       
    firebase.database().ref('section/' + this.theUser.uid + '/classid_' + this.classid + '/sectionid_' + sectionid ).set(sectioninfo)
    .then(() => {   
        console.log('section saved');
        this.addclasssection('sectionid_' + sectionid);
    }).catch((err)=>{
      console.log(err);  
    });
  }

  addclasssection(sectionid){
    let Ref = 'class/' + this.theUser.uid + '/classid_' + this.classid + '/section_list/';
    firebase.database().ref(Ref)
    .once('value', (snap)=>{

      firebase.database().ref(Ref + (snap.val() ? snap.val().length : 0)).set(sectionid)
      .then(() => {
      }).catch((err)=>{
        console.log(err);
      });

    });

  }

}
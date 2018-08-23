"use strict";

class ViewCourseManager {
    constructor(theUser,courseid){
        this.theUser = theUser;
        this.courseid = courseid;

        /*$('.add-course-class').click(()=>{
            location.href = "createclass.html?courseid="+this.courseid;//proceed to page that creates course class and cards
        });*/

        // This reads the current courses from the database and
        // adds them to the UI so we can see them.
        
        this.viewcoursesinfo();
        this.viewCourseClassList();
       
    }

    viewcoursesinfo(){  
        var courseRef = firebase.database().ref('course/' + this.theUser.uid + '/' + this.courseid);
            courseRef.once('value', (snapshot) => {
            if(snapshot){
                let course = snapshot.val();
                this.insertCourseInfo(course);
            }
        });
    }

    insertCourseInfo(course) {
        var list = $('.courseinfo-cont').append(
        `<div class="col-md-1"></div>
         <div class="col-md-2">
             <img src="${ course.imageurl }" class="img-thumbnail" alt="" width="250px" height="150px">
         </div>
         <div class="col-md-8">
             <div id="courseid_${course.key}" class="jumbotron" style="padding:5px; border-radius: 0px; background-color: transparent;">
                 <h1 class="display-4">${ course.title }</h1>
                 <p class="lead">${ course.description }</p>
                 <hr class="my-4">
                 <a class="btn btn-primary btn-lg btnlearnmore" href="#" role="button" style="border-radius:0px;">Learn more</a>
             </div>
         </div>
        <div class="col-md-1"></div>`);
    }

    viewCourseClassList(){
        var courseclassesRef = firebase.database().ref('course/' + this.theUser.uid + '/' +  this.courseid+'/class_list/');
        let classRef = firebase.database().ref().child('class/'+this.theUser.uid);

        courseclassesRef.once('value', (snapshot) => {

            snapshot.forEach((childSnapshot)=> {
                
                var classid = childSnapshot.key;

                classRef.child(classid).once('value', (classsnap) => {

                    let classid = classsnap.key;
                
                    let classe = classsnap.val();

                    if(classid && classe){
                        this.insertClassInTable(classid, classe);
                    }
                              
                    // This required to make the UI look correctly by Material Design Lite
                    componentHandler.upgradeElements(document.getElementById('class-container'));
                   
                });

            });

        });
    }

    insertClassInTable(classid, classe){
        var list = $('.flex-container').append(
            `<div class="demo-card-square mdl-card mdl-shadow--2dp" id="${classid}">
                <div class="mdl-card__title mdl-card--expand" data-imgname="${ classe.image_name }" data-imgurl="${ classe.image_url }" style="background: url('${ classe.image_url }'); background-position: center; background-repeat: no-repeat; background-size: cover;">
                    <h2 class="mdl-card__title-text course-title">${ classe.title == undefined ? 'description' : classe.title }</h2>
                </div>
                <div class="mdl-card__supporting-text course-des">
                ${ classe.description == undefined ? 'description' : classe.description }
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <a href="#" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect btn-update-class">
                      Take this class 
                    </a>
                </div>
            </div>`);
    }

}
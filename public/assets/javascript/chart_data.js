"use strict";
class ChartData {
    constructor(theUser, carditemid, chartitemid, id) {
        this.theUser = theUser;
        this.carditemid = carditemid;
        this.itemid = chartitemid;
        this.id = id;

        if (!id) {
            return;
        }
        var chartField = `<tr id = "chart_data-${id}"> 
        <td><input id="textData${this.itemid}" name = "Text"  type="text" placeholder="textfield"  class="form-control" /></td>
        <td><input id="textDataValue${this.itemid}" name = "Value" class="form-control" type="text"  placeholder="value"  /></td>
        <td><button id="textDataDelete${this.itemid}" type="button" class="btn btn-outline-secondary remove"><i class="material-icons">delete</i></button></td>
        </tr>`;

      //  $(chartField).appendTo($('#item-id-' + this.itemid).find('.answer-row')).hide().show('fadein'); //apply fadein effects 
      //  $(chartField).appendTo($(`textBoxContainer${this.itemid}`)).hide().show('fadein'); //apply fadein effects
        $(chartField).appendTo($('#item-id-' + this.itemid).find(`#textBoxContainer${this.itemid}`)).hide().show('fadein'); //apply fadein effects 

        this.setOptionClosedClickEventListener(); 


        $(`#chart_data-${id}`).find(`#textData${this.itemid}`).on('input', (e) => {
            this.saveinfo('textData', e.currentTarget.value);
        });
        $(`#chart_data-${id}`).find(`#textDataValue${this.itemid}`).on('input', (e) => {
            this.saveinfo('textDataValue', e.currentTarget.value);
        });
        // $(`#textData${this.itemid}`).on('input', (e) => {
        //     this.saveinfo('textData', e.currentTarget.value);
        // });
        // $(`#textDataValue${this.itemid}`).on('input', (e) => {
        //     this.saveinfo('textDataValue', e.currentTarget.value);
        // });
        // This required to make the UI look correctly by Material Design Lite
        componentHandler.upgradeElements(document.getElementById('item-id-' + this.itemid));

    }
    setCourseTextData(text) {
        $(`#textData${this.itemid}`).text(text);
      }
    setCourseTextDataValue(text) {
        $(`#textDataValue${this.itemid}`).text(text);
      }
    setOptionClosedClickEventListener() {
        $(`#textDataDelete${this.itemid}`).click((e) => {
            this.deleteitem();
        });
    }

    autoresizeTextarea() {
        //creadits to the author: https://stephanwagner.me/auto-resizing-textarea
        $.each($("textarea[data-autoresize]"), function() {
          var offset = this.offsetHeight - this.clientHeight;
    
          var resizeTextarea = function(el) {
            $(el).css("height", "auto").css("height", el.scrollHeight + offset);
          };
          $(this).on("keyup input", function() {
              resizeTextarea(this);
            }).removeAttr("data-autoresize");
        });
      }

      deleteitem() {
        firebase.database().ref('item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/chartData/' + this.id).update({
                'isDeleted': true
            })
            .then(() => {
                console.log('Deleted');
            }).catch((err) => {
                console.log(err);
            });
    }
    saveinfo(fields, value) {

        let modkey = (new Date()).getTime().toString(36); //creates new last modified key
        sessionStorage.setItem('chart_data-' + this.id, modkey);
 
        var updates = {};
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/chartData/' + this.id + '/last_modified_key/'] = modkey;
        updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/chartData/' + this.id + '/' + fields + '/'] = value;

        firebase.database().ref().update(updates)
            .then(() => {
                console.log('Saved');
            }).catch((err) => {
                console.log(err);
            });
    }
}
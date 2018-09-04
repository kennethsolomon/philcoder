"use strict";
class ChartItemManager {
    constructor(theUser, carditemid, elementtype, id = null, orderno) {
        this.theUser = theUser;
        this.carditemid = carditemid; //also get the parent readinglist item id of this newly created quiz item, we pass it through our constructor of this class
        this.itemid;
        this.type = elementtype;
        this.charts = [];
        this.orderno = orderno;

        if (id) {
            this.itemid = id;
          } else {
            return;
          }

          var element = `<div id="item-id-${
            this.itemid
          }" class="item question_answer" data-type="${elementtype}">
              <h5 class="text-center">Chart Input Data</h5>
      
              <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                  <a class="nav-item nav-link active" id="nav-table-tab" style="color: blue" data-toggle="tab" href="#nav-table${
                    this.itemid
                  }" role="tab" aria-controls="nav-table" aria-selected="true">Table</a>
                  <a class="nav-item nav-link" id="nav-textfield-tab" style="color: blue" data-toggle="tab" href="#nav-textfield${
                    this.itemid
                  }" role="tab" aria-controls="nav-textfield" aria-selected="false">Textfield</a>
                  <a class="nav-item nav-link" id="nav-upload-tab" style="color: blue" data-toggle="tab" href="#nav-upload${
                    this.itemid
                  }" role="tab" aria-controls="nav-upload" aria-selected="false">Upload</a>
                </div>
              </nav>
              <div class="tab-content" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-table${
                  this.itemid
                }" role="tabpanel" aria-labelledby="nav-table-tab">
                  <div class="table table-responsive">
                    <table>
                      <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                      </tr>
                      <tbody id="textBoxContainer${this.itemid}" class="ui-sortable" style="cursor:pointer">
                        <tr> 
                          <td><input id="textData${this.itemid}" name = "Text"  type="text" placeholder="textfield"  class="form-control" /></td>
                          <td><input id="textDataValue${this.itemid}" name = "Value" class="form-control" type="text"  placeholder="value"  /></td>
                          <td><button id="textDataDelete${this.itemid}" type="button" class="btn btn-outline-secondary remove"><i class="material-icons">delete</i></button></td>
                        </tr>          
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colspan="5">
                            <button id="btnAdd${
                              this.itemid
                            }" type="button" class="btn btn-primary" data-toggle="tooltip" data-original-title="Add more controls"><i class="glyphicon glyphicon-plus-sign"></i>&nbsp; Add&nbsp;
                            </button></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
        
                <div class="tab-pane fade" id="nav-textfield${
                  this.itemid
                }" role="tabpanel" aria-labelledby="nav-textfield-tab">
                  <textarea style="width:97%" id="chart-textfield-data${
                    this.itemid
                  }" cols="100" rows="7"></textarea>
                </div>
        
                <div class="tab-pane fade" id="nav-upload${
                  this.itemid
                }" role="tabpanel" aria-labelledby="nav-upload-tab">
                  <input type="file" id="chart-file">
                </div>
              </div>
        
              <div class="container">
                <div class="controls">
                  <h5 class="label">Chart Type</h5>
                  <select name="chartType" id="chartType">
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="radar">Radar</option>
                    <option value="polarArea">Polar Area</option>
                    <option value="doughnut">Doughnut</option>
                    <option value="pie">Pie</option>
                  </select>
        
                  <button id="btnUpdateData" type="button">Update Data</button>
                </div>
                <div class="container">
                <canvas id="myChart${this.itemid}" width="100" height="100"></canvas>
                </div>
              </div>   
                        `; //Initialize element

             $("#carditemid_" + this.carditemid).find(".items-container > ul").append(`
                <li style="order: ${this.orderno};">
                    <span class="item-close-but">
                        <i class="material-icons">close</i>
                    </span>
                    <div id="item-con-id-${ this.itemid}" class="item-container">
                                    ${element}
                    </div>
                </li>`);
  
      $("#item-id-" + this.itemid).focus();     

      this.setEventHandlerListener();
  
      // This required to make the UI look correctly by Material Design Lite
      componentHandler.upgradeElements(document.getElementById("item-id-" + this.itemid));
      
      var database = firebase.database();
      var setoptionChangeListener = (carditemid, itemid) => {
      this.item_caRef = database.ref("item/" + this.theUser.uid + "/carditemid_" + carditemid + "/item-id-" + itemid + "/chartData/" );
      this.item_caRef.on("child_added", data => {
        var id = data.key;
        var textData = data.val().textData;
        var textDataValue = data.val().textDataValue;
        var isDeleted = data.val().isDeleted;

        if (!isDeleted) {
          var chart = new ChartData(
            this.theUser,
            this.carditemid,
            this.itemid,
            id
          );
          chart.setTextData(textData);
          chart.setTextDataValue(textDataValue);

          this.charts.push(chart);

          this.item_caRef.child(id).on("child_changed", data => {
            var field = data.key;
            var value = data.val();

            if (field == "isDeleted") {
              $(`#chart_data-${id}`).fadeOut("slow", () => {
                this.item_caRef.child("chart_data-" + id).off();
                $(`#chart_data-${id}`).remove();
              });
            } else if (field == "textData") {
              var my_mod_key = sessionStorage.getItem("chart_data-" + id);
              //console.log(my_mod_key);
              data.ref.parent.child("last_modified_key").once("value", snap => {
                var last_modified_key = snap.val();
                if (last_modified_key != my_mod_key) {
                  $(`#chart_data-${id}`)
                    .find(`#textData${this.itemid}`)
                    .val(value);
                } else {
                  //console.log('this');
                }
              });
            } else if (field == "textDataValue") {
              var my_mod_key = sessionStorage.getItem("chart_data-" + id);
              //console.log(my_mod_key);
              data.ref.parent.child("last_modified_key").once("value", snap => {
                var last_modified_key = snap.val();
                if (last_modified_key != my_mod_key) {
                  $(`#chart_data-${id}`)
                    .find(`#textData${this.itemid}`)
                    .val(value);
                } else {
                  //console.log('this');
                }
              });
            }
          });
        }
      });
    };
    setoptionChangeListener(this.carditemid, this.itemid);
    }
}
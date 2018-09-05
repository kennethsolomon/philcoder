"use strict";

class ChartItemManager {
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
                          <div id="item-con-id-${
                            this.itemid
                          }" class="item-container">
                              ${element}
                          </div>
                      </li>
                  `);

    $("#item-id-" + this.itemid).focus();

    $('a[data-toggle="tab"]').on("shown.bs.tab", e => {
      var target = $(e.target).attr("href"); // activated tab
      this.selectedTableTab = target == "#nav-table";
      this.selectedTextfieldTab = target == "#nav-textfield";
      this.selectedUploadTab = target == "#nav-upload";
    });

    
    this.setupChart();
    this.getDynamicTextBox();
    this.setEventHandlerListener();
    
    

    // This required to make the UI look correctly by Material Design Lite
    componentHandler.upgradeElements(
      document.getElementById("item-id-" + this.itemid)
    );
  }
  getDynamicTextBox(value) {
    return (
      '<td><input id="textData' + this.itemid + '" name = "Text"  type="text" placeholder="textfield" value = "' + value  +'" class="form-control" /></td>' +
      '<td><input id="textDataValue' + this.itemid + '" name = "Value" class="form-control" type="text"  placeholder="value" value = "' +value +'" /></td>' +
      '<td><button id="textDataDelete' +
      this.itemid +
      '" type="button" class="btn btn-outline-secondary remove"><i class="material-icons">delete</i></button></td>'
    );
  }


  saveItem(fields, value) {
    let modkey = new Date().getTime().toString(36); //creates new last modified key
    sessionStorage.setItem("item-id-" + this.itemid, modkey);

    var updates = {};
    updates[
      "item/" +
        this.theUser.uid +
        "/carditemid_" +
        this.carditemid +
        "/item-id-" +
        this.itemid +
        "/last_modified_key/"
    ] = modkey;
    updates[
      "item/" +
        this.theUser.uid +
        "/carditemid_" +
        this.carditemid +
        "/item-id-" +
        this.itemid +
        "/" +
        fields +
        "/"
    ] = value;

    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        console.log("Item saved");
      })
      .catch(err => {
        console.log(err);
      });
  }

  setupChart() {
    //Grace Code
    $(`#textBoxContainer${this.itemid}`).sortable();

    $(() => {
      $(`#btnAdd${this.itemid}`).bind("click", e => {
        var div = $(`<tr />`);
        div.html(this.getDynamicTextBox(""));
        $(`#textBoxContainer${this.itemid}`).append(div);
        this.saveinfo('textData', e.currentTarget.value);
        this.saveinfo('textDataValue', e.currentTarget.value);
      });

      $("body").on("click", ".remove", function() {
        $(this)
          .closest("tr")
          .remove();
      });
    });

    // $('#btnUpdateData').click((e) => {
    //     this.updateData();
    // });

    // $('#chartType').change(() => {
    //     this.updateChartType();
    // });
    this.myData = {
      // labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      // datasets: [{
      //     label: "My First dataset",
      //     backgroundColor: ['rgb(0, 153, 51)', 'rgb(204, 0, 102)', 'rgb(204, 0, 204)', 'rgb(255, 153, 51)', 'rgb(0, 153, 255)', 'rgb(0, 153, 153)', 'rgb(204, 102, 0)'],
      //     data: [15, 10, 5, 2, 20, 30, 45],
      //     borderWidth: 1,
      //     borderColor: '#777',
      //     hoverBorderWidth: 3,
      //     hoverBorderColor: '#000'
      // }]
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      datasets: [
        {
          label: "",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }
      ]
    };

    Chart.defaults.global.defaultFontFamily = "monospace";
    this.chart = document
      .getElementById("myChart" + this.itemid)
      .getContext("2d");
    this.myChart = new Chart(this.chart, {
      type: "line", // bar, horizontalBar, pie, line, doughnut, radar, polarArea, Bubble
      data: this.myData,
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });

    //     this.ctx = document.getElementById("myChart").getContext('2d');
    //  this.myChart = new Chart(this.ctx, {
    //     type: 'bar',
    //     data: {
    //         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    //         datasets: [{
    //            // label: '# of Votes',
    //             data: [12, 19, 3, 5, 2, 3],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(255, 206, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)'
    //             ],
    //             borderColor: [
    //                 'rgba(255,99,132,1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //                 'rgba(75, 192, 192, 1)',
    //                 'rgba(153, 102, 255, 1)',
    //                 'rgba(255, 159, 64, 1)'
    //             ],
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             yAxes: [{
    //                 ticks: {
    //                     beginAtZero:true
    //                 }
    //             }]
    //         }
    //     }
    // });

    // MY CODE
    // this.chart = document.getElementById("myChart").getContext("2d");

    // this.myChart = new Chart(this.chart, {
    //   type: "line", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    //   data: {
    //     labels: [
    //       "Boston",
    //       "Worcester",
    //       "Springfield",
    //       "Lowell",
    //       "Cambridge",
    //       "New Bedford"
    //     ], //Sample Data
    //     datasets: [
    //       {
    //         label: "Population",
    //         data: [612342, 123123, 432252, 456456, 678123, 234567],
    //         backgroundColor: [
    //           "rgba(168, 168, 168, 0.6)",
    //           "rgba(54, 162, 235, 0.6)",
    //           "rgba(255, 206, 86, 0.6)",
    //           "rgba(75, 192, 192, 0.6)",
    //           "rgba(153, 102, 255, 0.6)",
    //           "rgba(255, 159, 64, 0.6)"
    //         ],
    //         borderWidth: 1,
    //         borderColor: "gray"
    //       }
    //     ]
    //   },
    //   options: {}
    // });
   
  }

  //Test functions

  setEventHandlerListener() {
    $("#item-id-" + this.itemid)
      .parents("li")
      .hover(
        function() {
          $(this)
            .find(".item-close-but")
            .css({
              display: "block"
            });
        },
        function() {
          $(this)
            .find(".item-close-but")
            .css({
              display: "none"
            });
        }
      );

    $("#item-id-" + this.itemid)
      .parents("li")
      .find(".item-close-but")
      .click(e => {
        var c = e.currentTarget;
        if (confirm("Delete this item?")) {
          $(c)
            .parent()
            .fadeOut("slow", e => {
              $(c)
                .parent()
                .remove();
            });
        }
      });

      
      
  $(`#textData${this.itemid}`).on("input", e => {
    console.log('textData');
  });

      $("#item-id-" + this.itemid)
      .find(".textData"+ this.itemid)
      .on("input", e => {
        console.log('textData');
          this.saveItem("textData", $(e.currentTarget).val());
      });
      $("#item-id-" + this.itemid)
      .parents("td")
      .find(".textDataValue"+ this.itemid)
      .on("input", e => {
        console.log("textdatavalue")
          this.saveItem("textDataValue", $(e.currentTarget).val());
      });

  }
  setCourseTextData(text) {
    $("#item-id-" + this.itemid)
        .find("#textData")
        .text(text);
  }
  setCourseTextDataValue(text) {
    $("#item-id-" + this.itemid)
        .find("#textDataValue")
        .text(text);
  }


  saveinfo(fields, value) {

    let modkey = (new Date()).getTime().toString(36); //creates new last modified key
    sessionStorage.setItem("item-id-" + this.itemid, modkey);
    var updates = {};
    updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/chartData/' + this.id + '/last_modified_key/'] = modkey;
    updates['item/' + this.theUser.uid + '/carditemid_' + this.carditemid + '/item-id-' + this.itemid + '/chartData/' + this.itemid + '/' + fields + '/'] = value;

    firebase.database().ref().update(updates)
        .then(() => {
            console.log('Saved');
        }).catch((err) => {
            console.log(err);
        });
}
}

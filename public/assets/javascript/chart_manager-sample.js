"use strict";
class ChartItemManager {
    constructor(carditemid, elementtype, id) {
        this.carditemid = carditemid;
        this.itemid;

        this.selectedTableTab = true;
        this.selectedTextfieldTab = false;
        this.selectedUploadTab = false;

        if (id) {
            this.itemid = id;
        } else {
            let chartid = (new Date()).getTime().toString(36); //creates new quiz item id
            this.itemid = chartid; //Initialize quiz item id
        }

        var element = `<div id="item-id-${this.itemid}" class="item chart_item" data-type="chart">
      <h5 class="text-center">Chart Input Data</h5>

      <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <a class="nav-item nav-link active" id="nav-table-tab" style="color: blue" data-toggle="tab" href="#nav-table" role="tab" aria-controls="nav-table" aria-selected="true">Table</a>
          <a class="nav-item nav-link" id="nav-textfield-tab" style="color: blue" data-toggle="tab" href="#nav-textfield" role="tab" aria-controls="nav-textfield" aria-selected="false">Textfield</a>
          <a class="nav-item nav-link" id="nav-upload-tab" style="color: blue" data-toggle="tab" href="#nav-upload" role="tab" aria-controls="nav-upload" aria-selected="false">Upload</a>
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane fade show active" id="nav-table" role="tabpanel" aria-labelledby="nav-table-tab">
          <div class="table table-responsive">
            <table>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
              <tbody id="textBoxContainer${this.itemid}" class="ui-sortable" style="cursor:pointer">
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="5">
                    <button id="btnAdd" type="button" class="btn btn-primary" data-toggle="tooltip" data-original-title="Add more controls"><i class="glyphicon glyphicon-plus-sign"></i>&nbsp; Add&nbsp;
                    </button></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="tab-pane fade" id="nav-textfield" role="tabpanel" aria-labelledby="nav-textfield-tab">
          <textarea id="chart-textfield-data" cols="100" rows="7"></textarea>
        </div>

        <div class="tab-pane fade" id="nav-upload" role="tabpanel" aria-labelledby="nav-upload-tab">
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
          <canvas id="myChart${this.itemid}" width="400" height="400"></canvas>
        </div>
      </div>   
				`; //Initialize element   

        $('#readingitem-id-' + this.carditemid).find('.items-container > ul').append(`
        <li>
            <span class="item-close-but">
                <i class="material-icons">close</i>
            </span>
            <div id="item-con-id-${this.itemid}" class="item-container">
                ${element}
            </div>
        </li>
		`);

        $('#item-id-' + this.itemid).focus();

        $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
            var target = $(e.target).attr("href") // activated tab
            this.selectedTableTab = target == '#nav-table';
            this.selectedTextfieldTab = target == '#nav-textfield';
            this.selectedUploadTab = target == '#nav-upload';
        });

        this.setEventHandlerListener();
        this.setupChart();
        this.getDynamicTextBox();
    }


    setEventHandlerListener() {

        $('#item-id-' + this.itemid).parents('li').hover(function () {
            $(this).find('.item-close-but').css({
                'display': 'block'
            });
        }, function () {
            $(this).find('.item-close-but').css({
                'display': 'none'
            });
        });

        $('#item-id-' + this.itemid).parents('li').find('.item-close-but').click((e) => {
            var c = e.currentTarget;
            if (confirm('Delete this item?')) {
                $(c).parent().fadeOut('slow', (e) => {
                    $(c).parent().remove();
                });
            }
        });
    }

    getDynamicTextBox(value) {
        return '<td><input name = "Text" class="firstDataItem" type="text" placeholder="textfield" value = "' + value + '" class="form-control" /></td>' +
            '<td><input name = "Value" class="secondDataItem" type="text"  placeholder="value" value = "' + value + '" /></td>' +
            '<td><button type="button" class="btn btn-outline-secondary remove"><i class="material-icons">delete</i></button></td>'
    }

    setCsvData(textData) {
        var arrayOfData = Papa.parse(textData);
        let labels = [];
        let data = [];
        for (var i = 0; i < arrayOfData.data.length; i++) {
            labels.push(arrayOfData.data[i][0]);
            data.push(arrayOfData.data[i][1]);
        }

        this.myData = {
            labels: labels,
            datasets: [{
                label: "My First dataset",
                backgroundColor: ['rgb(0, 153, 51)', 'rgb(204, 0, 102)', 'rgb(204, 0, 204)', 'rgb(255, 153, 51)', 'rgb(0, 153, 255)', 'rgb(0, 153, 153)', 'rgb(204, 102, 0)'],
                data: data,
                borderWidth: 1,
                borderColor: '#777',
                hoverBorderWidth: 3,
                hoverBorderColor: '#000'
            }]
        }
        this.updateChartType();
    }

    updateData() {
        if (this.selectedTableTab) {
            var firstValues = $(`#textBoxContainer${this.itemid}`).find('.firstDataItem');
            var secondValues = $(`#textBoxContainer${this.itemid}`).find('.secondDataItem');

            let labels = [];
            let data = [];
            for (var i = 0; i < firstValues.length; i++) {
                labels.push(firstValues[i].value);
                data.push(secondValues[i].value);
            }
            this.myData = {
                labels: labels,
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: ['rgb(0, 153, 51)', 'rgb(204, 0, 102)', 'rgb(204, 0, 204)', 'rgb(255, 153, 51)', 'rgb(0, 153, 255)', 'rgb(0, 153, 153)', 'rgb(204, 102, 0)'],
                    data: data,
                    borderWidth: 1,
                    borderColor: '#777',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#000'
                }]
            }
        } else if (this.selectedTextfieldTab) {
            var textData = $('#chart-textfield-data').val();
            console.log(textData);
            this.setCsvData(textData);
        } else {
            // Check for the various File API support.
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                return alert('The File APIs are not fully supported in this browser.');
            }
            var i = $('#chart-file');
            var input = i[0];
            if (input.files && input.files[0]) {
                var file = input.files[0];
                var fr = new FileReader();
                fr.onload = () => {
                    var textData = fr.result;
                    this.setCsvData(textData);
                };
                fr.readAsText(file);
            } else {
                alert("File not selected or browser incompatible.")
            }
        }
    }

    setupChart() {
        $(`#textBoxContainer${this.itemid}`).sortable();

        $(() => {
            $("#btnAdd").bind("click", (e) => {
                var div = $("<tr />");
                div.html(this.getDynamicTextBox(""));
                $(`#textBoxContainer${this.itemid}`).append(div);
            });
            $("body").on("click", ".remove", function () {
                $(this).closest("tr").remove();
            });
        });

        $('#btnUpdateData').click((e) => {
            this.updateData();
        });

        $('#chartType').change(() => {
            this.updateChartType();
        });

        this.myData = {
            labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            datasets: [{
                label: "My First dataset",
                backgroundColor: ['rgb(0, 153, 51)', 'rgb(204, 0, 102)', 'rgb(204, 0, 204)', 'rgb(255, 153, 51)', 'rgb(0, 153, 255)', 'rgb(0, 153, 153)', 'rgb(204, 102, 0)'],
                data: [15, 10, 5, 2, 20, 30, 45],
                borderWidth: 1,
                borderColor: '#777',
                hoverBorderWidth: 3,
                hoverBorderColor: '#000'
            }]
        }

        Chart.defaults.global.defaultFontFamily = "monospace";
        this.chart = document.getElementById('myChart').getContext('2d');
        this.myChart = new Chart(this.chart, {
            type: 'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea, Bubble
            data: this.myData
        });
    }

    addData() {
        this.myChart.data.labels.push(document.getElementById("Text").value);
        this.myChart.data.datasets[0].data.push(document.getElementById("Value").value);
        this.myChart.update();
    }

    updateChartType() {
        // Since you can't update chart type directly in Charts JS you must destroy original chart and rebuild
        this.myChart.destroy();
        this.myChart = new Chart(this.chart, {
            type: document.getElementById("chartType").value,
            data: this.myData,
        });
    }
}
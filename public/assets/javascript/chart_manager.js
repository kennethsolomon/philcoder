"use strict";

class ChartManager {

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

        var element = `<div id="item-id-${this.itemid}" class="item question_answer" data-type="${elementtype}">
                        <div class="question-menu-row">
                            <div class="question-col">
                                <div class="mdl-textfield mdl-js-textfield" style="width: 90%;">
                                    <!--<input class="mdl-textfield__input txtlink" type="text">-->
                                    <textarea class="mdl-textfield__input txtlink" rows="1" type="text" style="box-sizing: border-box; resize: none;" data-autoresize></textarea>
                                    <label class="mdl-textfield__label" for="sample3" style="margin-bottom: 0px;">https://www.youtube.com/</label>
                                </div>
                            </div>
                        </div>
                      </div>`; //Initialize element

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


        let myChart = document.getElementById('myChart').getContext('2d');

        let courseChart = new Chart(myChart, {
            type: 'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data: {
                labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'], //Sample Data
                datasets: [{
                    label: 'Population',
                    data: [
                        612342,
                        123123,
                        432252,
                        456456,
                        678123,
                        234567
                    ],
                    backgroundColor: [
                        'rgba(168, 168, 168, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                    ],
                    borderWidth: 1,
                    borderColor: 'gray'
                }]
            },
            options: {

            }
        });




    }
}

const test = new ChartManager();
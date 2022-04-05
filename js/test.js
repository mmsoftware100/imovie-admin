"use strict";
$(document).ready(function() {
    /////////////////////////////////////////////////////
    // Global variable
    var webserviceUrl = "http://localhost/live/imovie/api/v1/index.php?url=";
    //var webserviceUrl = "https://imoviemm.com/api/v1/index.php?url=";

    var categorySelectEndpoint = webserviceUrl + "category/select";
    var categoryInsertEndpoint = webserviceUrl + "category/insert";
    var categoryUpdateEndpoint = webserviceUrl + "category/update";
    var categoryDeleteEndpoint = webserviceUrl + "category/delete";
    var categorySerialNo = 1;

    var seasonSelectEndpoint = webserviceUrl + "season/select";
    var seasonInsertEndpoint = webserviceUrl + "season/insert";
    var seasonUpdateEndpoint = webserviceUrl + "season/update";
    var seasonDeleteEndpoint = webserviceUrl + "season/delete";
    var seasonSerialNo = 1;

    var resolutionSelectEndpoint = webserviceUrl + "resolution/select";
    var resolutionInsertEndpoint = webserviceUrl + "resolution/insert";
    var resolutionUpdateEndpoint = webserviceUrl + "resolution/update";
    var resolutionDeleteEndpoint = webserviceUrl + "resolution/delete";
    var resolutionSerialNo = 1;
    
    var movieSelectEndpoint = webserviceUrl + "movie/select";
    var movieInsertEndpoint = webserviceUrl + "movie/insert";
    var movieUpdateEndpoint = webserviceUrl + "movie/update";
    var movieDeleteEndpoint = webserviceUrl + "movie/delete";
    var movieSerialNo = 1;


    var bankEndpoint = webserviceUrl + "bank/index.php";
    var currencyEndpoint = webserviceUrl + "currency/index.php";
    var accountEndpoint = webserviceUrl + "account/index.php";
    var authEndpoint = webserviceUrl + "auth/index.php";
    var titleEndpoint = webserviceUrl + "title/index.php";
    var financeEndpoint = webserviceUrl + "finance/index.php";
    var calculationEndpoint = webserviceUrl + "calculation/index.php";
    var printEndpoint = webserviceUrl + "print/index.php";
    var userEndpoint = webserviceUrl + "user/index.php";
    var bankSerialNo = 1;
    var currencySerialNo = 1;
    var accountSerialNo = 1;
    var authSerialNo = 1;
    var titleSerialNo = 1;
    var financeSerialNo = 1;
    var calcualtionSerialNo = 1;
    var userSerialNo = 1;
    var total_income_mmk = 0;
    var total_income_usd = 0;
    var total_income_euro = 0;
    var total_expense_mmk = 0;
    var total_expense_usd = 0;
    var total_expense_euro = 0;
    var total_balance_mmk = 0;
    var total_balance_usd = 0;
    var total_balance_euro = 0;

    var socket_server_attemp = 0;
    var socket_server_limit = 5;

    var datatable_instances = {};

    var thisIsJwt = localStorage.getItem("jwt");
    console.log("jwt is ");
    console.log(thisIsJwt);
    if(thisIsJwt === null){
        //window.location.assign("login.html");
    }
    window.onbeforeunload = function() {
        //alert("onbeforeunload");
        localStorage.removeItem("jwt");
        return '';
    };
    // $(window).unload(function(){
    //     alert("unload");
    // });

    $("body").show();
    //var socket_server = 'localhost:5508'; // production server
    var socket_server = window.location.hostname + ":5508"; // production server
    console.log("socket_server is " + socket_server);
    var socket = io(socket_server); // connect to socket server
    /* socket test */
    // var socket = io(socket_server); // connect to socket server
    var socket_message = {
        "hello": "world"
    };
    socket.emit('data', socket_message); // send data

    // setInterval(function(){ socket.emit('data', socket_message); }, 3000);
    // receive
    socket.on('data', (data) => {
        console.log("socket data is received from server ");
        console.log(data);
    });
    // socket.on('connect_failed', function() {
    //     console.log("connect_failed");
    //     document.write("Sorry, there seems to be an issue with the connection!");
    // });
    // Ref; https://stackoverflow.com/questions/18248128/socket-io-connect-with-server-offline
    socket.on('connect_error', function(err) {
        console.log("connect_error : "+err);
        //document.write("Sorry, there seems to be an issue with the connection!");
        //toastr.warning("Connection Error : "+err);
        socket_server_attemp++;
        if(socket_server_attemp >= socket_server_limit){
            socket.disconnect();
            toastr.warning("Connection Error : "+err);
            //document.write("<h2>Contact Server Adminstractor </h2>");
        }
        
    });
    // socket.on('error', function (err) {
    //     console.log("error");
    //     document.write("Sorry, there seems to be an issue with the connection!" + err);
    // });
    //document.write("hell");
    /* socket test */
    /////////////////////////////////////////////////////
    // Global Function
    // 1. Show Loading Modal 
    function showLoadingModal(msg) {
        $('body').loadingModal({
            position: 'auto',
            text: msg,
            color: '#fff',
            opacity: '0.7',
            backgroundColor: 'rgb(0,0,0)',
            animation: 'wave'
        });
    }
    // 2. Hide Loading Modal
    function hideLoadingModal() {
        $('body').loadingModal('hide');
        // destroy the plugin
        $('body').loadingModal('destroy');
    }
    function makeDataTable(dataTable){
        //$("#" + dataTable)
        //$('#priceTable').DataTable({
        // check
        for(let dataTableId in datatable_instances){
            if(dataTableId == dataTable ) datatable_instances[dataTableId].destroy();
        }
        let newDataTable = $("#" + dataTable).DataTable({
          "ordering": false,
          dom: 'Bfrtip',
          buttons: ['excel', 'print'],
          initComplete: function() {
            this.api().columns().every(function() {
              var column = this;
              var select = $('<select><option value=""></option></select>').appendTo($(column.footer()).empty())
                //.appendTo( $(column.header()).append("<tr></tr>") )
                .on('change', function() {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });
              column.data().unique().sort().each(function(d, j) {
                select.append('<option value="' + d + '">' + d + '</option>')
              });
            });
          }
        });
        $(".buttons-print").removeClass("btn-secondary").addClass("buttons-export");
        $(".buttons-excel").removeClass("btn-secondary").addClass("buttons-export");

        datatable_instances[dataTable] = newDataTable;

    }

    // 3. Set Local Storage
    // 4. Get Local Storage
    /////////////////////////////////////////////////
    // Data Model
    // Collection
    // View
    // May be this is blue print for the whole project

    /// Category Model 
    
    var Category = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var CategoryList = Backbone.Collection.extend({
        url: "#",
        model: Category
    });
    var CategoryViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#categoryRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("CategoryViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this category : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this category");
                showLoadingModal("Delete the category on server ....");
                console.log("category delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                //var opsType = "delete";
                //var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("categoryId : " + this.model.get("id"));
                //formdata.append("ops_type", opsType);
                //formdata.append("jwt", jwt);
                var categoryTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: categoryDeleteEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("category delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                categoryTempModel.destroy();
                                msg = categoryTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Category : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("category delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("category delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this category");
            }
        },
        edit: function() {
            console.log("CategoryViewRow edit is clicked on " + this.model.get("name"));
            var categoryEditView = new CategoryViewEdit({
                model: this.model
            });
            $("#newCategoryModal > div").html(categoryEditView.render().el);
        },
        destroy: function() {
            console.log("CategoryModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("CategoryModel is change");
            this.render(); // update the ui
        }
    });
    var CategoryViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .categoryEditForm": "submit"
        },
        template: _.template($('#categoryEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("CategoryModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("CategoryModel is change");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("categoryEditForm is submited");
            // ajax call is here :D
            // change ui as network call may be long 
            // at least disabled submit button and 
            // indicate loading text and icon on the button 
            // or (full screen loading ) this may be more impressive and get attention 
            // and can prevent upcoming unwanted user clicks
            evt.preventDefault();
            // we have to check for ops_type
            // if ( id still null ) this is insert
            // else this is update ops :D
            // 1. validate and hide edit modal if we can't hide / change the view 
            // 2. show loading modal
            // 3. hide loading modal 
            // 4. show returned message as modal
            // ajax part 1 : UI Manipulation
            $("#newCategoryModal").modal('hide');
            showLoadingModal("Uploading to server");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            // bankEditForm
            // how to get view form data
            // let's start with input field values
            var categoryName = $("#categoryNameInput").val();
            var categoryId = $("#categoryIdInput").val();
            // insert / update
            let endPoint = '';
            if (categoryId == "") {
                console.log("this is new category");
                endPoint = categoryInsertEndpoint;
            } else {
                opsType = "update";
                formdata.append("id", categoryId);
                endPoint = categoryUpdateEndpoint;
            }
            console.log("categoryName : " + categoryName);
            console.log("categoryId : " + categoryId);

            //formdata.append("ops_type", opsType);
            formdata.append("name", categoryName);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: endPoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("category edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Categorys.find(function(category) {
                                return category.get("id") == categoryId;
                            });
                            if (orgData === undefined) {
                                console.log("id cannot find id " + categoryId);
                                msg = response.data.name + " is added";
                                Categorys.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Category : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("category edit ajax is complete");
        }
    });


    //// Season Model
    
    var Season = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var SeasonList = Backbone.Collection.extend({
        url: "#",
        model: Season
    });
    var SeasonViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#seasonRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("SeasonViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this season : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this season");
                showLoadingModal("Delete the season on server ....");
                console.log("season delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                //var opsType = "delete";
                //var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("seasonId : " + this.model.get("id"));
                //formdata.append("ops_type", opsType);
                //formdata.append("jwt", jwt);
                var seasonTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: seasonDeleteEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("season delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                seasonTempModel.destroy();
                                msg = seasonTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Season : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("season delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("season delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this season");
            }
        },
        edit: function() {
            console.log("SeasonViewRow edit is clicked on " + this.model.get("name"));
            var seasonEditView = new SeasonViewEdit({
                model: this.model
            });
            $("#newSeasonModal > div").html(seasonEditView.render().el);
        },
        destroy: function() {
            console.log("SeasonModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("SeasonModel is change");
            this.render(); // update the ui
        }
    });
    var SeasonViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .seasonEditForm": "submit"
        },
        template: _.template($('#seasonEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("SeasonModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("SeasonModel is change");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("seasonEditForm is submited");
            // ajax call is here :D
            // change ui as network call may be long 
            // at least disabled submit button and 
            // indicate loading text and icon on the button 
            // or (full screen loading ) this may be more impressive and get attention 
            // and can prevent upcoming unwanted user clicks
            evt.preventDefault();
            // we have to check for ops_type
            // if ( id still null ) this is insert
            // else this is update ops :D
            // 1. validate and hide edit modal if we can't hide / change the view 
            // 2. show loading modal
            // 3. hide loading modal 
            // 4. show returned message as modal
            // ajax part 1 : UI Manipulation
            $("#newSeasonModal").modal('hide');
            showLoadingModal("Uploading to server");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            // bankEditForm
            // how to get view form data
            // let's start with input field values
            var seasonName = $("#seasonNameInput").val();
            var seasonId = $("#seasonIdInput").val();
            // insert / update
            let endPoint = '';
            if (seasonId == "") {
                console.log("this is new season");
                endPoint = seasonInsertEndpoint;
            } else {
                opsType = "update";
                formdata.append("id", seasonId);
                endPoint = seasonUpdateEndpoint;
            }
            console.log("seasonName : " + seasonName);
            console.log("seasonId : " + seasonId);

            //formdata.append("ops_type", opsType);
            formdata.append("name", seasonName);
            //formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: endPoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("season edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Seasons.find(function(season) {
                                return season.get("id") == seasonId;
                            });
                            if (orgData === undefined) {
                                console.log("id cannot find id " + seasonId);
                                msg = response.data.name + " is added";
                                Seasons.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Season : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("Season edit ajax is complete");
        }
    });


    
    /// Resolution Model 
    
    var Resolution = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var ResolutionList = Backbone.Collection.extend({
        url: "#",
        model: Resolution
    });
    var ResolutionViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#resolutionRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("ResolutionViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this resolution : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this resolution");
                showLoadingModal("Delete the resolution on server ....");
                console.log("resolution delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                //var opsType = "delete";
                //var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("resolutionId : " + this.model.get("id"));
                //formdata.append("ops_type", opsType);
                //formdata.append("jwt", jwt);
                var resolutionTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: resolutionDeleteEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("resolution delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                resolutionTempModel.destroy();
                                msg = resolutionTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Resolution : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("resolution delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("resolution delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this resolution");
            }
        },
        edit: function() {
            console.log("ResolutionViewRow edit is clicked on " + this.model.get("name"));
            var resolutionEditView = new ResolutionViewEdit({
                model: this.model
            });
            $("#newResolutionModal > div").html(resolutionEditView.render().el);
        },
        destroy: function() {
            console.log("ResolutionModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("ResolutionModel is change");
            this.render(); // update the ui
        }
    });
    var ResolutionViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .resolutionEditForm": "submit"
        },
        template: _.template($('#resolutionEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("ResolutionModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("ResolutionModel is change");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("resolutionEditForm is submited");
            // ajax call is here :D
            // change ui as network call may be long 
            // at least disabled submit button and 
            // indicate loading text and icon on the button 
            // or (full screen loading ) this may be more impressive and get attention 
            // and can prevent upcoming unwanted user clicks
            evt.preventDefault();
            // we have to check for ops_type
            // if ( id still null ) this is insert
            // else this is update ops :D
            // 1. validate and hide edit modal if we can't hide / change the view 
            // 2. show loading modal
            // 3. hide loading modal 
            // 4. show returned message as modal
            // ajax part 1 : UI Manipulation
            $("#newResolutionModal").modal('hide');
            showLoadingModal("Uploading to server");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            // bankEditForm
            // how to get view form data
            // let's start with input field values
            var resolutionName = $("#resolutionNameInput").val();
            var resolutionId = $("#resolutionIdInput").val();
            // insert / update
            let endPoint = '';
            if (resolutionId == "") {
                console.log("this is new resolution");
                endPoint = resolutionInsertEndpoint;
            } else {
                opsType = "update";
                formdata.append("id", resolutionId);
                endPoint = resolutionUpdateEndpoint;
            }
            console.log("resolutionName : " + resolutionName);
            console.log("resolutionId : " + resolutionId);

            //formdata.append("ops_type", opsType);
            formdata.append("name", resolutionName);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: endPoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("resolution edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Resolutions.find(function(resolution) {
                                return resolution.get("id") == resolutionId;
                            });
                            if (orgData === undefined) {
                                console.log("id cannot find id " + resolutionId);
                                msg = response.data.name + " is added";
                                Resolutions.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Resolution : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("resolution edit ajax is complete");
        }
    });


    /// Movie Model

    function makeCategory(id, name){
        return {id, name};
    }
    function makeFileModel(id, name, file_size, resolution){
        return {id, name, file_size, resolution};
    }
    function makeResolution(id, resolution, duration, resolution_description, file_model_list){
        return {id, resolution, duration, resolution_description, file_model_list};
    }
    function makeSeason(id, season, season_description, resolution_list){
        return {id, season, season_description, resolution_list};
    }

    var Movie = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: "",
            description: "",
            poster_portrait: "",
            poster_landscape: "",
            release_year: "",
            movie_type: "1",
            category: [
                makeCategory(0,'')
            ],
            season_list: [
                makeSeason(0, '', '', 
                    [
                        makeResolution(0,'',0,'',
                            [
                                makeFileModel(0,'',0,1)
                            ]
                        )
                    ]
                ),
            ]
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        },
        addNewSeason: function(data) {
            this.set({
                name: data
            });
        },
        updateMovie: function(data) {
            console.log('MovieModel->updateMovie');
            this.set(data);
            console.log(this);
        }
    });
    var MovieList = Backbone.Collection.extend({
        url: "#",
        model: Movie
    });
    var MovieViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#movieRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("movieViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this movie : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this movie");
                showLoadingModal("Delete the movie on server ....");
                console.log("movie delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                //var opsType = "delete";
                //var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("movieId : " + this.model.get("id"));
                //formdata.append("ops_type", opsType);
                //formdata.append("jwt", jwt);
                var movieTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: movieDeleteEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("movie delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                movieTempModel.destroy();
                                msg = movieTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  movie : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("movie delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("movie delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this movie");
            }
        },
        edit: function() {
            console.log("movieViewRow edit is clicked on " + this.model.get("name"));
            var movieEditView = new MovieViewEdit({
                model: this.model
            });
            $("#newMovieModal > div").html(movieEditView.render().el);
            $('.mdb-select').materialSelect();
            //requestMovieFormFocus();
        },
        destroy: function() {
            console.log("movieModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("movieModel is change");
            this.render(); // update the ui
        }
    });
    var MovieViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .movieEditForm": "submit",
            "click .testClick": "testClick",
            "click .addFileButton": "addFileButton",
            "click .addResolutionButton": "addResolutionButton",
            "click .addSeasonButton": "addSeasonButton",
            "change #movieIdInput": "movieIdInput",
            "change #movieNameInput": "movieNameInput",
            "change #movieDescriptionInput": "movieDescriptionInput",
            "change #movieReleaseYearInput": "movieReleaseYearInput",
            "change #moviePosterPortraitInput": "moviePosterPortraitInput",
            "change #moviePosterLandscapeInput": "moviePosterLandscapeInput",
            "change #movieCategorySelect": "movieCategorySelect",
            "change .seasonSelect": "seasonSelect",
            "change .seasonDescriptionInput": "seasonDescriptionInput",
            "change .resolutionSelect": "resolutionSelect",
            "change .episdoeDescription": "episdoeDescription",
            "change .resolutionDuration": "resolutionDuration",
            "change .resolutionSelect": "resolutionSelect",
            "change .fileName": "fileName",
            "change .fileSize": "fileSize",
        },
        template: _.template($('#movieEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("movieModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("movieModel is change");
            //this.render(); // update the ui
            //$('.mdb-select').materialSelect();
            //requestMovieFormFocus();
        },
        testClick: function(){
            console.log("MovieEditView->testClick");
            let modelData = this.model.toJSON();
            this.model.setName(modelData.name+' hello setName');
            //this.render();
        },
        movieIdInput : function(event){
            console.log('movieIdInput');
            let modelData = this.model.toJSON();
            let movieId = $(event.currentTarget).val();
            modelData.id = movieId;
            this.model.updateMovie(modelData);
        },
        movieNameInput : function(event){
            console.log('movieNameInput');
            let modelData = this.model.toJSON();
            let movieName = $(event.currentTarget).val();
            modelData.name = movieName;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        movieDescriptionInput : function(event){
            console.log('movieDescriptionInput');
            let modelData = this.model.toJSON();
            let movieDescription = $(event.currentTarget).val();
            modelData.description = movieDescription;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        movieReleaseYearInput : function(event){
            console.log('movieReleaseYearInput');
            let modelData = this.model.toJSON();
            let movieReleaseYear = $(event.currentTarget).val();
            modelData.release_year = movieReleaseYear;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        moviePosterPortraitInput : function(event){
            console.log('moviePosterPortraitInput');
            let modelData = this.model.toJSON();
            let moviePosterPortrait = $(event.currentTarget).val();
            modelData.poster_portrait = moviePosterPortrait;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        moviePosterLandscapeInput : function(event){
            console.log('moviePosterLandscapeInput');
            let modelData = this.model.toJSON();
            let moviePosterLandscape = $(event.currentTarget).val();
            modelData.poster_landscape = moviePosterLandscape;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        movieCategorySelect : function(event){
            console.log('movieCategorySelect');
            let modelData = this.model.toJSON();
            let movieCategory = $(event.currentTarget).val();
            modelData.category = movieCategory;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        seasonSelect : function(event){
            console.log('seasonSelect');
            let modelData = this.model.toJSON();
            let season = $(event.currentTarget).val();
            console.log('seasonSelect '+season);

            console.log($(event.currentTarget));
            let seasonIndex = $(event.currentTarget).attr('data-season');
            console.log('seasonIndex '+seasonIndex);
            console.log(modelData.season_list[seasonIndex]);
            modelData.season_list[seasonIndex].season = season;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        seasonDescriptionInput : function(event){
            console.log('seasonDescriptionInput');
            let modelData = this.model.toJSON();
            let seasonDescription = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            console.log('seasonIndex '+seasonIndex);
            console.log(modelData.season_list[seasonIndex]);
            modelData.season_list[seasonIndex].season_description = seasonDescription;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        resolutionSelect : function(event){
            console.log('resolutionSelect');
            let modelData = this.model.toJSON();
            let resolution = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].resolution = resolution;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        episdoeDescription : function(event){
            console.log('episdoeDescription');
            let modelData = this.model.toJSON();
            let episdoeDescription = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].resolution_description = episdoeDescription;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        resolutionDuration : function(event){
            console.log('resolutionDuration');
            let modelData = this.model.toJSON();
            let resolutionDuration = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].duration = resolutionDuration;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        resolutionSelect : function(event){
            console.log('resolutionSelect');
            let modelData = this.model.toJSON();
            let resolution = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            let fileIndex = $(event.currentTarget).attr('data-file');
            console.log('seasonIndex is '+seasonIndex);
            console.log(modelData.season_list[seasonIndex]);
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].file_model_list[fileIndex].resolution = resolution;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        fileName : function(event){
            console.log('fileName');
            let modelData = this.model.toJSON();
            let fileName = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            let fileIndex = $(event.currentTarget).attr('data-file');
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].file_model_list[fileIndex].name = fileName;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        fileSize : function(event){
            console.log('fileSize');
            let modelData = this.model.toJSON();
            let fileSize = $(event.currentTarget).val();
            let seasonIndex = $(event.currentTarget).attr('data-season');
            let resolutionIndex = $(event.currentTarget).attr('data-resolution');
            let fileIndex = $(event.currentTarget).attr('data-file');
            modelData.season_list[seasonIndex].resolution_list[resolutionIndex].file_model_list[fileIndex].file_size = fileSize;
            this.model.updateMovie(modelData);
            console.log(this.model);
        },
        addFileButton : function(event ){
            console.log("addFileButton click");
            let modelData = this.model.toJSON();
            let newFile = makeFileModel(0,'',0,1);
            let season = $(event.currentTarget).attr('data-season');
            let resolution = $(event.currentTarget).attr('data-resolution');
            console.log("season " + season);
            console.log("resolution " + resolution);
            modelData.season_list[season].resolution_list[resolution].file_model_list.push(newFile);
            console.log(modelData);
            this.model.updateMovie(modelData);
            this.render(); // changes event ထွက်မလာလို့
            $('.mdb-select').materialSelect();
            requestMovieFormFocus();
        },
        addResolutionButton : function(event ){
            console.log("addResolutionButton click");
            let modelData = this.model.toJSON();
            let newFile = makeFileModel(0,'',0,1);

            let newResolution = makeResolution(0,'',0,'',[newFile]);

            let season = $(event.currentTarget).attr('data-season');
            console.log("season " + season);
            modelData.season_list[season].resolution_list.push(newResolution);
            console.log(modelData);
            this.model.updateMovie(modelData);
            this.render(); // changes event ထွက်မလာလို့
            $('.mdb-select').materialSelect();
            requestMovieFormFocus();
        },
        addSeasonButton : function(event ){
            console.log("addSeasonButton click");
            let modelData = this.model.toJSON();
            let newFile = makeFileModel(0,'',0,1);
            let newResolution = makeResolution(0,'',0,'',[newFile]);
            let newSeason = makeSeason(0, '', '',[newResolution]);
            modelData.season_list.push(newSeason);
            console.log(modelData);
            this.model.updateMovie(modelData);
            this.render(); // changes event ထွက်မလာလို့
            $('.mdb-select').materialSelect();
            requestMovieFormFocus();
        },
        submit: function(evt) {
            console.log("movieEditForm is submited");
            // ajax call is here :D
            // change ui as network call may be long 
            // at least disabled submit button and 
            // indicate loading text and icon on the button 
            // or (full screen loading ) this may be more impressive and get attention 
            // and can prevent upcoming unwanted user clicks
            evt.preventDefault();
            let modelData = this.model.toJSON();
            console.log(modelData);

            // we have to check for ops_type
            // if ( id still null ) this is insert
            // else this is update ops :D
            // 1. validate and hide edit modal if we can't hide / change the view 
            // 2. show loading modal
            // 3. hide loading modal 
            // 4. show returned message as modal
            // ajax part 1 : UI Manipulation
            $("#newMovieModal").modal('hide');
            showLoadingModal("Uploading movie to server");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            var formdata = new FormData(); // how to get this form
            //var opsType = "insert";
            //var jwt = thisIsJwt;
            // bankEditForm
            // how to get view form data
            // let's start with input field values
            var movieName = $("#movieNameInput").val();
            var movieId = $("#movieIdInput").val();
            // insert / update
            let endPoint = '';
            if (movieId == "") {
                console.log("this is new movie");
                endPoint = movieInsertEndpoint;
            } else {
                opsType = "update";
                formdata.append("id", movieId);
                endPoint = movieUpdateEndpoint;
            }
            console.log("movieName : " + movieName);
            console.log("movieId : " + movieId);

            //formdata.append("ops_type", opsType);
            formdata.append("name", movieName);
            //formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: endPoint,
                type: "post",
                data: JSON.stringify(modelData),
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("movie edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Movies.find(function(movie) {
                                return movie.get("id") == movieId;
                            });
                            if (orgData === undefined) {
                                console.log("movie id cannot find id and added . " + movieId);
                                msg = response.data.name + " is added";
                                Movies.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new movie : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("movie edit ajax is complete");
        }
    });




    /////////////////////////// OLD Section /////////////////////////////////////

    var Bank = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var BankList = Backbone.Collection.extend({
        url: "#",
        model: Bank
    });
    var BankViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#bankRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("BankEditRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this bank : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this bank");
                showLoadingModal("Delete the bank on server ....");
                console.log("bank delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("bankId : " + this.model.get("id"));
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                var bankTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: bankEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("bank delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                bankTempModel.destroy();
                                msg = bankTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Bank : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("bank delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("bank delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this bank");
            }
        },
        edit: function() {
            console.log("BankViewRow edit is clicked on " + this.model.get("name"));
            var bankEditView = new BankViewEdit({
                model: this.model
            });
            $("#newBankModal > div").html(bankEditView.render().el);
        },
        destroy: function() {
            console.log("BankModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("BankModel is change");
            this.render(); // update the ui
        }
    });
    var BankViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .bankEditForm": "submit"
        },
        template: _.template($('#bankEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("BankModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("BankModel is change");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("bankEditForm is submited");
            // ajax call is here :D
            // change ui as network call may be long 
            // at least disabled submit button and 
            // indicate loading text and icon on the button 
            // or (full screen loading ) this may be more impressive and get attention 
            // and can prevent upcoming unwanted user clicks
            evt.preventDefault();
            // we have to check for ops_type
            // if ( id still null ) this is insert
            // else this is update ops :D
            // 1. validate and hide edit modal if we can't hide / change the view 
            // 2. show loading modal
            // 3. hide loading modal 
            // 4. show returned message as modal
            // ajax part 1 : UI Manipulation
            $("#newBankModal").modal('hide');
            showLoadingModal("Uploading to server");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            // bankEditForm
            // how to get view form data
            // let's start with input field values
            var bankName = $("#bankNameInput").val();
            var bankId = $("#bankIdInput").val();
            // insert / update
            if (bankId == "") {
                console.log("this is new bank");
            } else {
                opsType = "update";
                formdata.append("id", bankId);
            }
            console.log("bankName : " + bankName);
            console.log("bankId : " + bankId);
            formdata.append("ops_type", opsType);
            formdata.append("name", bankName);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: bankEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("bank edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Banks.find(function(bank) {
                                return bank.get("id") == bankId;
                            });
                            if (orgData === undefined) {
                                console.log("id cannot find id " + bankId);
                                msg = response.data.name + " is added";
                                Banks.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Bank : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("bank edit ajax is complete");
        }
    });




    var Currency = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var CurrencyList = Backbone.Collection.extend({
        url: "#",
        model: Currency
    });
    var CurrencyViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#currencyRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("CurrencyViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this currency : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this currency");
                showLoadingModal("Delete the currency on server ....");
                console.log("currency delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("bankId : " + this.model.get("id"));
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                var currencyTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: currencyEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("currency delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                currencyTempModel.destroy();
                                msg = currencyTempModel.get("name") + " is deleted ";
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Currency : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("currecny delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("currency delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this currency");
            }
        },
        edit: function() {
            console.log("CurrencyViewRow edit is clicked on " + this.model.get("name"));
            var currencyEditView = new CurrencyViewEdit({
                model: this.model
            });
            $("#newCurrencyModal > div").html(currencyEditView.render().el);
        },
        destroy: function() {
            console.log("CurrencyViewRow : CurrencyModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("CurrencyModel is changed");
            this.render(); // update the ui
        }
    });
    var CurrencyViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .currencyEditForm": "submit"
        },
        template: _.template($('#currencyEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("CurrencyModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("CurrencyModel is changed");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("currencyEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newCurrencyModal").modal('hide');
            showLoadingModal("Uploading Currency Data to server");
            // ajax part 2 : Data Manipulation
            console.log("currency edit ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            var currencyName = $("#currencyNameInput").val();
            var currencyId = $("#currencyIdInput").val();
            // insert / update
            if (currencyId == "") {
                console.log("this is new currency");
            } else {
                opsType = "update";
                formdata.append("id", currencyId);
            }
            console.log("currencyName : " + currencyName);
            console.log("currencyId : " + currencyId);
            formdata.append("ops_type", opsType);
            formdata.append("name", currencyName);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: currencyEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("currency edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Currencys.find(function(currency) {
                                return currency.get("id") == currencyId;
                            });
                            if (orgData === undefined) {
                                console.log("currency id cannot find id " + currencyId);
                                msg = response.data.name + " is added";
                                Currencys.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Bank : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("currency edit network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("currency edit ajax is complete");
        }
    });
    var Account = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null,
            opening_date: null,
            balance: null,
            exchange_rate: null,
            currency_id: null,
            bank_id: null,
            currency: {
                id: null,
                name: null,
            },
            bank: {
                id: null,
                name: null,
            }
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        }
        // we do not set any other value
        // cause we just set Serial No 
        // and set all new
    });
    var AccountList = Backbone.Collection.extend({
        url: "#",
        model: Account
    });
    var AccountViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#accountRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("AccountViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this account
            var deleteConfirm = confirm("Are you sure to delete this account : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this account");
                showLoadingModal("Delete the account on server ....");
                console.log("account delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("id", this.model.get("id"));
                console.log("currencyId : " + this.model.get("id"));
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                var accountTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: accountEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("account delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                msg = accountTempModel.get("name") + " is deleted ";
                                accountTempModel.destroy();
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Account : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("account delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                            toastr.warning(response.responseText);
                        }, 1000);
                    }
                });
                console.log("account delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this account");
            }
        },
        edit: function() {
            console.log("AccountViewRow edit is clicked on " + this.model.get("name"));
            var accountEditView = new AccountViewEdit({
                model: this.model
            });
            $("#newAccountModal > div").html(accountEditView.render().el);
            $('.mdb-select').materialSelect();
        },
        destroy: function() {
            console.log("AccountViewRow : AccountModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("AccountModel is changed : we're watching from AccountView");
            this.render(); // update the ui
        }
    });
    var AccountViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .accountEditForm": "submit"
        },
        template: _.template($('#accountEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            modelData.currencys = Currencys.toJSON();
            modelData.banks = Banks.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("AccountModel is destroy : We're watching from AccountEditView");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("AccountModel is changed : We're watching from AccountEditView");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("AccountEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newAccountModal").modal('hide');
            showLoadingModal("Uploading Account Data to server");
            // ajax part 2 : Data Manipulation
            console.log("account edit ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            var accountId = $("#accountIdInput").val();
            var accountName = $("#accountNameInput").val();
            var accountBalance = $("#accountBalanceInput").val();
            var accountOpeningDate = $("#accountOpeningDateInput").val();
            var accountExchangeRate = $("#accountExchangeRateInput").val();
            var currencyId = $("#accountCurrencySelect").val();
            var bankId = $("#accountBankSelect").val();
            // insert / update
            if (accountId == "") {
                console.log("this is new account");
            } else {
                opsType = "update";
                formdata.append("id", accountId);
            }
            console.log("accountId : " + accountId);
            console.log("accountName : " + accountName);
            console.log("accountBalance : " + accountBalance);
            console.log("accountOpeningDate : " + accountOpeningDate);
            console.log("accountExchangeRate : " + accountExchangeRate);
            console.log("currencyId : " + currencyId);
            console.log("bankId : " + bankId);
            formdata.append("ops_type", opsType);
            formdata.append("jwt", jwt);
            formdata.append("name", accountName);
            formdata.append("balance", accountBalance);
            formdata.append("opening_date", accountOpeningDate);
            formdata.append("exchange_rate", accountExchangeRate);
            formdata.append("currency", currencyId);
            formdata.append("bank", bankId);
            // ajax part 3 : request
            $.ajax({
                url: accountEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("account edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Accounts.find(function(account) {
                                return account.get("id") == accountId;
                            });
                            if (orgData === undefined) {
                                console.log("account id cannot find id " + accountId);
                                msg = response.data.name + " is added";
                                Accounts.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Account : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("account edit network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("account edit ajax is complete");
        }
    });
    var AccountViewRowDashboard = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .list": "list",
        },
        template: _.template($('#accountRowDashboardTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("AccountViewRowDashboard : AccountModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("AccountModel is changed : we're watching from AccountVieRowwDashboard");
            this.render(); // update the ui
        },
        list: function() {
            console.log("AccountViewRowDashboard edit is clicked on " + this.model.get("name"));
            /*
              1.  get account_id
              2.  get set of finance that contain that account_id
              3.  render each finance row 
              4.  append to full modal list 
            */
            $("#listFinanceModalTable > tbody").empty();
            let account_id = this.model.get('id');
            let financeForAccount = Finances.where({
                account_id: account_id
            }); //Issues.where({status: 2});
            console.log("found finance " + financeForAccount.length);
            if (financeForAccount.length == 0) {
                $("#listFinanceModalTable > tbody").append("<tr><td colspan='5'>There is no transaction for now</td></tr>");
            }
            for (let i = 0; i < financeForAccount.length; i++) {
                let serialNo = i + 1;
                financeForAccount[i].setSerialNo(serialNo);
                var financeForAccountView = new FinanceViewRow({
                    model: financeForAccount[i]
                });
                $("#listFinanceModalTable > tbody").append(financeForAccountView.render().el);
            }
            //var financeForAccount = Finances.find
            // var accountEditView = new AccountViewRow({model : this.model});
            // $("#newAccountModal > div").html(accountEditView.render().el);
            // $('.mdb-select').materialSelect();
        }
    });
    var Auth = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        }
    });
    var AuthList = Backbone.Collection.extend({
        url: "#",
        model: Auth
    });
    var AuthViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#authRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("AuthEditRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this bank
            var deleteConfirm = confirm("Are you sure to delete this auth : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this auth");
                showLoadingModal("Delete the auth on server ....");
                console.log("auth delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                formdata.append("id", this.model.get("id"));
                console.log("authId : " + this.model.get("id"));
                var authTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: authEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("auth delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                msg = authTempModel.get("name") + " is deleted ";
                                authTempModel.destroy();
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Auth : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("auth delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                        }, 1000);
                    }
                });
                console.log("auth delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this auth");
            }
        },
        edit: function() {
            console.log("AuthViewRow edit is clicked on " + this.model.get("name"));
            var authEditView = new AuthViewEdit({
                model: this.model
            });
            $("#newAuthModal > div").html(authEditView.render().el);
        },
        destroy: function() {
            console.log("AuthModel is destroyed");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("AuthModel is changed");
            this.render(); // update the ui
        }
    });
    var AuthViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .authEditForm": "submit"
        },
        template: _.template($('#authEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("AuthModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("AuthModel is changed");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("authEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newAuthModal").modal('hide');
            showLoadingModal("Uploading Auth Data to server");
            // ajax part 2 : Data Manipulation
            console.log("auth edit ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            var authName = $("#authNameInput").val();
            var authId = $("#authIdInput").val();
            // insert / update
            if (authId == "") {
                console.log("this is new auth");
            } else {
                opsType = "update";
                formdata.append("id", authId);
            }
            console.log("authName : " + authName);
            console.log("authId : " + authId);
            formdata.append("ops_type", opsType);
            formdata.append("name", authName);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: authEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("auth edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Auths.find(function(auth) {
                                return auth.get("id") == authId;
                            });
                            if (orgData === undefined) {
                                console.log("auth id cannot find id " + authId);
                                msg = response.data.name + " is added";
                                Auths.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Auth : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("auth edit network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("auth edit ajax is complete");
        }
    });
    var Title = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null,
            balance: null,
            total_income: null,
            total_expense: null,
            exchange_rate: null,
            opening_date: null,
            calculation: null,
            currency_id: null,
            currency: {
                id: null,
                name: null,
            }
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        }
    });
    var TitleList = Backbone.Collection.extend({
        url: "#",
        model: Title
    });
    var TitleViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete"
        },
        template: _.template($('#titleRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("TitleViewRow delete is clicked on " + this.model.get("name"));
            // comfirm delete operation for this account
            var deleteConfirm = confirm("Are you sure to delete this title : " + this.model.get("name"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this title");
                showLoadingModal("Delete the title on server ....");
                console.log("title delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                formdata.append("id", this.model.get("id"));
                console.log("titleId : " + this.model.get("id"));
                var titleTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: titleEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("title delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                msg = titleTempModel.get("name") + " is deleted ";
                                titleTempModel.destroy();
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Title : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("title delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                            toastr.warning(response.responseText);
                        }, 1000);
                    }
                });
                console.log("title delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this title");
            }
        },
        edit: function() {
            console.log("TitleViewRow edit is clicked on " + this.model.get("name"));
            var titleEditView = new TitleViewEdit({
                model: this.model
            });
            $("#newTitleModal > div").html(titleEditView.render().el);
            $('.mdb-select').materialSelect();
        },
        destroy: function() {
            console.log("TitleViewRow : TitleModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("TitleModel is changed : we're watching from TitleView");
            this.render(); // update the ui
        }
    });
    var TitleViewRowDashboard = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .list": "list",
        },
        template: _.template($('#titleRowDashboardTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("TitleViewRowDashboard : TitleModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("TitleModel is changed : we're watching from TitleViewDashboard");
            this.render(); // update the ui
        },
        list: function() {
            console.log("AccountViewRowDashboard edit is clicked on " + this.model.get("name"));
            /*
              1.  get title_id
              2.  get set of finance that contain that title_id
              3.  render each finance row 
              4.  append to full modal list 
            */
            $("#listFinanceModalTable > tbody").empty();
            let title_id = this.model.get('id');
            let financeForTitle = Finances.where({
                title_id: title_id
            }); //Issues.where({status: 2});
            console.log("found finance " + financeForTitle.length);
            if (financeForTitle.length == 0) {
                $("#listFinanceModalTable > tbody").append("<tr><td colspan='5'>There is no transaction for now</td></tr>");
            }
            for (let i = 0; i < financeForTitle.length; i++) {
                let serialNo = i + 1;
                financeForTitle[i].setSerialNo(serialNo);
                var financeForTitleView = new FinanceViewRow({
                    model: financeForTitle[i]
                });
                $("#listFinanceModalTable > tbody").append(financeForTitleView.render().el);
            }
            //var financeForAccount = Finances.find
            // var accountEditView = new AccountViewRow({model : this.model});
            // $("#newAccountModal > div").html(accountEditView.render().el);
            // $('.mdb-select').materialSelect();
        }
    });
    var TitleViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .titleEditForm": "submit"
        },
        template: _.template($('#titleEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            modelData.currencys = Currencys.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("TitleModel is destroy : We're watching from TitleEditView");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("TitleModel is changed : We're watching from TitleEditView");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("TitleEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newTitleModal").modal('hide');
            showLoadingModal("Uploading Title Data to server");
            // ajax part 2 : Data Manipulation
            console.log("account edit ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            var titleId = $("#titleIdInput").val();
            var titleName = $("#titleNameInput").val();
            var titleBalance = $("#titleBalanceInput").val();
            var titleTotalIncome = $("#titleTotalIncomeInput").val();
            var titleTotalExpense = $("#titleTotalExpenseInput").val();
            var titleOpeningDate = $("#titleOpeningDateInput").val();
            var titleExchangeRate = $("#titleExchangeRateInput").val();
            var calculation = $("#titleCalculationSelect").val();
            var currencyId = $("#titleCurrencySelect").val();
            // insert / update
            if (titleId == "") {
                console.log("this is new title");
            } else {
                opsType = "update";
                formdata.append("id", titleId);
            }
            console.log("titleId : " + titleId);
            console.log("titleName : " + titleName);
            console.log("titleBalance : " + titleBalance);
            console.log("titleTotalIncome : " + titleTotalIncome);
            console.log("titleTotalExpense : " + titleTotalExpense);
            console.log("titleOpeningDate : " + titleOpeningDate);
            console.log("titleExchangeRate : " + titleExchangeRate);
            console.log("calculation : " + calculation);
            console.log("currencyId : " + currencyId);
            formdata.append("ops_type", opsType);
            formdata.append("jwt", jwt);
            formdata.append("name", titleName);
            formdata.append("balance", titleBalance);
            formdata.append("total_income", titleTotalIncome);
            formdata.append("total_expense", titleTotalExpense);
            formdata.append("opening_date", titleOpeningDate);
            formdata.append("exchange_rate", titleExchangeRate);
            formdata.append("calculation", calculation);
            formdata.append("currency", currencyId);
            // ajax part 3 : request
            $.ajax({
                url: titleEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("title edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Titles.find(function(title) {
                                return title.get("id") == titleId;
                            });
                            if (orgData === undefined) {
                                console.log("title id cannot find id " + titleId);
                                msg = response.data.name + " is added";
                                Titles.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Title : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("title edit network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("title edit ajax is complete");
        }
    });
    var Finance = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            from_name: null,
            from_company: null,
            from_address: null,
            from_phone: null,
            to_name: null,
            to_company: null,
            to_address: null,
            to_phone: null,
            ops: null,
            amount: null,
            exchange_rate: null,
            description: null,
            created_date: null,
            modified_date: null,
            payment_method: null,
            payment_data: null,
            case_file: null,
            account_id: null,
            title_id: null,
            auth_id: null,
            auth: {
                id: null,
                name: null
            },
            account: {
                id: null,
                name: null
            },
            title: {
                id: null,
                name: null
            }
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        }
    });
    var FinanceList = Backbone.Collection.extend({
        url: "#",
        model: Finance
    });
    var FinanceViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit",
            "click .delete": "delete",
            "click .print": "print",
            "click .pdf": "pdf"
        },
        template: _.template($('#financeRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            console.log("Finance Model for Row is rendered");
            console.log(modelData);
            this.$el.html(this.template(modelData));
            return this;
        },
        delete: function() {
            console.log("FinanceViewRow delete is clicked on " + this.model.get("description"));
            // comfirm delete operation for this account
            var deleteConfirm = confirm("Are you sure to delete this finance : " + this.model.get("description"));
            if (deleteConfirm == true) {
                // call to ajax : UI Manipulation
                console.log("user confirm to delete this finance");
                showLoadingModal("Delete the finance on server ....");
                console.log("finance delete ajax is starting...");
                // ajax part 2 : Data Manipulation
                var formdata = new FormData(); // how to get this form
                var opsType = "delete";
                var jwt = thisIsJwt;
                formdata.append("ops_type", opsType);
                formdata.append("jwt", jwt);
                formdata.append("id", this.model.get("id"));
                console.log("titleId : " + this.model.get("id"));
                var financeTempModel = this.model; // to delete in success callback
                // ajax part 3 : Requesting 
                $.ajax({
                    url: financeEndpoint,
                    type: "post",
                    data: formdata,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log("finance delete request success");
                        console.log(response);
                        var msg = "";
                        setTimeout(function() {
                            hideLoadingModal();
                            if (response.status) {
                                msg = financeTempModel.get("description") + " is deleted ";
                                financeTempModel.destroy();
                                toastr.info(msg);
                            } else {
                                // there is error in data
                                // just show the error message
                                msg = "Can't delete  Finance : " + response.msg;
                                toastr.warning(msg);
                            }
                        }, 1000);
                    },
                    error: function(response) {
                        console.log("finance delete : network error");
                        console.log(response.responseText);
                        setTimeout(function() {
                            hideLoadingModal();
                            toastr.warning(response.responseText);
                        }, 1000);
                    }
                });
                console.log("finance delete ajax is complete");
            } else {
                // do nothing..
                console.log("user cancel to delete this finance");
            }
        },
        edit: function() {
            console.log("FinanceViewRow edit is clicked on " + this.model.get("description"));
            var financeEditView = new FinanceViewEdit({
                model: this.model
            });
            $("#newFinanceModal > div").html(financeEditView.render().el);
            $('.mdb-select').materialSelect();
        },
        print: function() {
            console.log("FinanceViewRow print is clicked on " + this.model.get("description"));
            showLoadingModal("Printing....");
            // var financeEditView = new FinanceViewEdit({model : this.model});
            // $("#newFinanceModal > div").html(financeEditView.render().el);
            // $('.mdb-select').materialSelect();
            // get print form html from server using this.model
            // open new window
            // ajax part 2 : Data Manipulation
            var formdata = new FormData(); // how to get this form
            var opsType = "print";
            var jwt = thisIsJwt;
            formdata.append("ops_type", opsType);
            formdata.append("jwt", jwt);
            let jsonObj = this.model.toJSON();
            let jsonStr = JSON.stringify(jsonObj);
            formdata.append("finance", jsonStr);
            console.log(this.model.toJSON());
            console.log(jsonStr);
            // ajax part 3 : Requesting 
            $.ajax({
                url: printEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("finance print request success");
                    console.log(response);
                    setTimeout(function() {
                        var newWindow = window.open();
                        newWindow.document.write(response);
                        hideLoadingModal();
                    }, 1000);
                },
                error: function(response) {
                    console.log("finance delete : network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("finance delete ajax is complete");
        },
        pdf: function() {
            console.log("pdf file is opened");
        },
        destroy: function() {
            console.log("FinanceViewRow : FinanceModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("FinanceModel is changed : we're watching from FinanceRowView");
            this.render(); // update the ui
        }
    });
    var FinanceViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .financeEditForm": "submit"
        },
        template: _.template($('#financeEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            modelData.accounts = Accounts.toJSON();
            modelData.titles = Titles.toJSON();
            modelData.auths = Auths.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("FinanceModel is destroy : We're watching from FinanceEditView");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("FinanceModel is changed : We're watching from FinanceEditView");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("FinanceEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newFinanceModal").modal('hide');
            showLoadingModal("Uploading Finance Data to server");
            // ajax part 2 : Data Manipulation
            console.log("finance edit ajax is starting...");
            var formdata = new FormData(); // how to get this form
            var opsType = "insert";
            var jwt = thisIsJwt;
            var financeIdInput = $("#financeIdInput").val();
            var financeDescriptionInput = $("#financeDescriptionInput").val();
            var financeAccountSelect = $("#financeAccountSelect").val();
            var financeTitleSelect = $("#financeTitleSelect").val();
            var financeAmountInput = $("#financeAmountInput").val();
            var financeExchangeRateInput = $("#financeExchangeRateInput").val();
            var financeOpsSelect = $("#financeOpsSelect").val();
            var financeCreatedDateRateInput = $("#financeCreatedDateRateInput").val();
            var financePaymentMethodSelect = $("#financePaymentMethodSelect").val();
            var financePaymentDataInput = $("#financePaymentDataInput").val();
            var financeAuthSelect = $("#financeAuthSelect").val();
            var financeFromNameInput = $("#financeFromNameInput").val();
            var financeFromCompanyInput = $("#financeFromCompanyInput").val();
            var financeFromAddressInput = $("#financeFromAddressInput").val();
            var financeFromPhoneInput = $("#financeFromPhoneInput").val();
            var financeToNameInput = $("#financeToNameInput").val();
            var financeToCompanyInput = $("#financeToCompanyInput").val();
            var financeToAddressInput = $("#financeToAddressInput").val();
            var financeToPhoneInput = $("#financeToPhoneInput").val();
            /*
              Getting file data :
              var form = new FormData(); 
              form.append("video", $("#fileInput")[0].files[0]);
              Ref; https://stackoverflow.com/questions/12281775/get-data-from-file-input-in-jquery
            */
            var financeCaseFileInput = $("#financeCaseFileInput")[0].files[0];
            console.log("financeCaseFileInput is ");
            console.log(financeCaseFileInput);
            //  var financeCaseFileInput2 = $("#financeCaseFileInput")[0].files[0];
            //  console.log("financeCaseFileInput is ");
            //  console.log(financeCaseFileInput);
            // insert / update
            if (financeIdInput == "") {
                console.log("this is new finance");
            } else {
                opsType = "update";
                formdata.append("id", financeIdInput);
            }
            console.log("financeIdInput : " + financeIdInput);
            console.log("financeDescriptionInput : " + financeDescriptionInput);
            console.log("financeAccountSelect : " + financeAccountSelect);
            console.log("financeTitleSelect : " + financeTitleSelect);
            console.log("financeAmountInput : " + financeAmountInput);
            console.log("financeExchangeRateInput : " + financeExchangeRateInput);
            console.log("financeOpsSelect : " + financeOpsSelect);
            console.log("financeCreatedDateRateInput : " + financeCreatedDateRateInput);
            console.log("financePaymentMethodSelect : " + financePaymentMethodSelect);
            console.log("financePaymentDataInput : " + financePaymentDataInput);
            console.log("financeAuthSelect : " + financeAuthSelect);
            console.log("financeFromNameInput : " + financeFromNameInput);
            console.log("financeFromCompanyInput : " + financeFromCompanyInput);
            console.log("financeFromAddressInput : " + financeFromAddressInput);
            console.log("financeFromPhoneInput : " + financeFromPhoneInput);
            console.log("financeToNameInput : " + financeToNameInput);
            console.log("financeToCompanyInput : " + financeToCompanyInput);
            console.log("financeToAddressInput : " + financeToAddressInput);
            console.log("financeToPhoneInput : " + financeToPhoneInput);
            formdata.append("ops_type", opsType);
            formdata.append("jwt", jwt);
            formdata.append("ops", financeOpsSelect);
            formdata.append("amount", financeAmountInput);
            formdata.append("exchange_rate", financeExchangeRateInput);
            formdata.append("description", financeDescriptionInput);
            formdata.append("created_date", financeCreatedDateRateInput);
            formdata.append("payment_method", financePaymentMethodSelect);
            formdata.append("payment_data", financePaymentDataInput);
            formdata.append("account", financeAccountSelect);
            formdata.append("title", financeTitleSelect);
            formdata.append("auth", financeAuthSelect);
            formdata.append("from_name", financeFromNameInput);
            formdata.append("from_company", financeFromCompanyInput);
            formdata.append("from_address", financeFromAddressInput);
            formdata.append("from_phone", financeFromPhoneInput);
            formdata.append("to_name", financeToNameInput);
            formdata.append("to_company", financeToCompanyInput);
            formdata.append("to_address", financeToAddressInput);
            formdata.append("to_phone", financeToPhoneInput);
            formdata.append("case_file", financeCaseFileInput);
            // ajax part 3 : request
            $.ajax({
                url: financeEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("finance edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Finances.find(function(finance) {
                                return finance.get("id") == financeIdInput;
                            });
                            var orgAccount = Accounts.find(function(account) {
                                return account.get("id") == financeAccountSelect;
                            });
                            var orgTitle = Titles.find(function(title) {
                                return title.get("id") == financeTitleSelect;
                            });
                            if (orgData === undefined) {
                                console.log("financeIdInput id cannot find id " + financeIdInput);
                                msg = response.data.description + " is added";
                                Finances.add(response.data);
                                orgAccount.set(response.data.account); // magic is in the air :D
                                orgTitle.set(response.data.title);
                            } else {
                                msg = response.data.description + " is updated";
                                orgData.set(response.data);
                                $('[data-toggle="tooltip"]').tooltip();
                            }
                            socket.emit('finance', response.data);
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new Finance : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("finance edit network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("finance edit ajax is complete");
        }
    });
    var User = Backbone.Model.extend({
        defaults: {
            id: null,
            serial_no: null,
            name: null,
            password: null,
            role : null,
            personal_data : null
        },
        setSerialNo: function(data) {
            this.set({
                serial_no: data
            });
        },
        setName: function(data) {
            this.set({
                name: data
            });
        }
    });
    var UserList = Backbone.Collection.extend({
        url: "#",
        model: User
    });
    var UserViewRow = Backbone.View.extend({
        tagName: "tr",
        className: "",
        events: {
            "click .edit": "edit"
        },
        template: _.template($('#userRowTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        edit: function() {
            console.log("UserViewRow edit is clicked on " + this.model.get("name"));
            let userEditView = new UserViewEdit({
                model: this.model
            });
            $("#newUserModal > div").html(userEditView.render().el);
            $('.mdb-select').materialSelect();
        },
        destroy: function() {
            console.log("UserModel is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log("UserModel is change");
            this.render(); // update the ui
        }
    });
    var UserViewEdit = Backbone.View.extend({
        tagName: "div",
        className: "modal-content",
        events: {
            "submit .userEditForm": "submit"
        },
        template: _.template($('#userEditTemplate').html()),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy)
            this.listenTo(this.model, 'change', this.change)
        },
        render: function() {
            var modelData = this.model.toJSON();
            this.$el.html(this.template(modelData));
            return this;
        },
        destroy: function() {
            console.log("User Model is destroy");
            this.remove(); // remove dom
        },
        change: function() {
            console.log(" User Model is change");
            this.render(); // update the ui
        },
        submit: function(evt) {
            console.log("userEditForm is submited");
            evt.preventDefault();
            // ajax part 1 : UI Manipulation
            $("#newUserModal").modal('hide');
            showLoadingModal("Uploading user data to server...");
            // ajax part 2 : Data Manipulation
            console.log("ajax is starting...");
            let formdata = new FormData(); // how to get this form
            let opsType = "insert";
            let jwt = thisIsJwt;
            let userName = $("#userNameInput").val();
            let userId = $("#userIdInput").val();
            let userPassword = $("#userPasswordInput").val();
            let userRole = $("#userRoleSelect").val();
            let userPersonalData = $("#userPersonalDataInput").val();
            // insert / update
            if (userId == "") {
                console.log("this is new user");
            } else {
                opsType = "update";
                formdata.append("id", userId);
            }
            console.log("userName : " + userName);
            console.log("userId : " + userId);
            console.log("userPassword : " + userPassword);
            console.log("userRole : " + userRole);
            console.log("userPersonalData : " + userPersonalData);

            formdata.append("ops_type", opsType);
            formdata.append("name", userName);
            formdata.append("password", userPassword);
            formdata.append("role", userRole);
            formdata.append("personal_data", userPersonalData);
            formdata.append("jwt", jwt);
            // ajax part 3 : request
            $.ajax({
                url: userEndpoint,
                type: "post",
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("user edit request success");
                    console.log(response);
                    var msg = "";
                    setTimeout(function() {
                        hideLoadingModal();
                        if (response.status) {
                            // Data Manipulation
                            var orgData = Users.find(function(user) {
                                return user.get("id") == userId;
                            });
                            if (orgData === undefined) {
                                console.log("id cannot find id " + userId);
                                msg = response.data.name + " is added";
                                Users.add(response.data);
                            } else {
                                msg = response.data.name + " is updated";
                                orgData.set(response.data);
                            }
                            toastr.info(msg);
                        } else {
                            // there is error in data
                            // just show the error message
                            msg = "Can't insert new User : " + response.msg;
                            toastr.warning(msg);
                        }
                    }, 1000);
                },
                error: function(response) {
                    console.log("network error");
                    console.log(response.responseText);
                    setTimeout(function() {
                        toastr.warning(response.responseText);
                        hideLoadingModal();
                    }, 1000);
                }
            });
            console.log("user edit ajax is complete");
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////////////





    // Global Collection

    var Categorys = new CategoryList();
    var Seasons = new SeasonList();
    var Resolutions = new ResolutionList();
    var Movies = new MovieList();



    var Banks = new BankList();
    var Currencys = new CurrencyList();
    var Accounts = new AccountList();
    var Auths = new AuthList();
    var Titles = new TitleList();
    var Finances = new FinanceList();
    var Users = new UserList();
    ////////////////////////////////////////////////////////////
    // Global Event Listener


    // 1. New Category Button Click
    $("#newCategoryButton").on("click", function() {
        console.log("newCategoryButton is clicked");
        /* what we have to do ?
          1. Modal is already open
          2. Render new bank edit view
          3. bank edit view will handle future event (insert / update )
        */
        var categoryModel = new Category();
        var categoryEditView = new CategoryViewEdit({
            model: categoryModel
        });
        $("#newCategoryModal > div").html(categoryEditView.render().el);
    });
    // 2. Categorys Event Listener
    Categorys.on('add', function(category) {
        console.log("new category is added ");
        console.log(Categorys.toJSON());
        // add to table the last bank
        category.setSerialNo(categorySerialNo);
        categorySerialNo++;
        var categoryView = new CategoryViewRow({
            model: category
        });
        $("#categoryTable > tbody").append(categoryView.render().el);
    });
    // 3. Category Destroy Listener
    Categorys.on('destroy', function(category) {
        console.log(category.get("name") + " is destroyed");
        categorySerialNo = 1;
        Categorys.each(function(category) {
            category.setSerialNo(categorySerialNo);
            categorySerialNo++;
        })
    });
    // 4. Category request foucs on modal input
    $("#newCategoryModal").on('shown.bs.modal', function() {
        $("#categoryIdInput").focus();
        $("#categoryNameInput").focus();
        $("#categoryIdInput").focus();
    });


    
    // 1. New Season Button Click
    $("#newSeasonButton").on("click", function() {
        console.log("newSeasonButton is clicked");
        /* what we have to do ?
          1. Modal is already open
          2. Render new bank edit view
          3. bank edit view will handle future event (insert / update )
        */
        var seasonModel = new Season();
        var seasonEditView = new SeasonViewEdit({
            model: seasonModel
        });
        $("#newSeasonModal > div").html(seasonEditView.render().el);
    });
    // 2. Seasons Event Listener
    Seasons.on('add', function(season) {
        console.log("new season is added ");
        console.log(Seasons.toJSON());
        // add to table the last bank
        season.setSerialNo(seasonSerialNo);
        seasonSerialNo++;
        var seasonView = new SeasonViewRow({
            model: season
        });
        $("#seasonTable > tbody").append(seasonView.render().el);
    });
    // 3. season Destroy Listener
    Seasons.on('destroy', function(season) {
        console.log(season.get("name") + " is destroyed");
        seasonSerialNo = 1;
        Seasons.each(function(season) {
            season.setSerialNo(seasonSerialNo);
            seasonSerialNo++;
        })
    });
    // 4. season request foucs on modal input
    $("#newSeasonModal").on('shown.bs.modal', function() {
        $("#seasonIdInput").focus();
        $("#seasonNameInput").focus();
        $("#seasonIdInput").focus();
    });


    // 1. New Resolution Button Click
    $("#newResolutionButton").on("click", function() {
        console.log("newResolutionButton is clicked");
        /* what we have to do ?
          1. Modal is already open
          2. Render new bank edit view
          3. bank edit view will handle future event (insert / update )
        */
        var resolutionModel = new Resolution();
        var resolutionEditView = new ResolutionViewEdit({
            model: resolutionModel
        });
        $("#newResolutionModal > div").html(resolutionEditView.render().el);
    });
    // 2. Resolutions Event Listener
    Resolutions.on('add', function(resolution) {
        console.log("new resolution is added ");
        console.log(Resolutions.toJSON());
        // add to table the last bank
        resolution.setSerialNo(resolutionSerialNo);
        resolutionSerialNo++;
        var resolutionView = new ResolutionViewRow({
            model: resolution
        });
        $("#resolutionTable > tbody").append(resolutionView.render().el);
    });
    // 3. Resolution Destroy Listener
    Resolutions.on('destroy', function(resolution) {
        console.log(resolution.get("name") + " is destroyed");
        resolutionSerialNo = 1;
        Resolutions.each(function(resolution) {
            resolution.setSerialNo(resolutionSerialNo);
            resolutionSerialNo++;
        })
    });
    // 4. Resolution request foucs on modal input
    $("#newResolutionModal").on('shown.bs.modal', function() {
        $("#resolutionIdInput").focus();
        $("#resolutionNameInput").focus();
        $("#resolutionIdInput").focus();
    });


    // 1. New Movie Button Click
    $("#newMovieButton").on("click", function() {
        console.log("newMovieButton is clicked");
        /* what we have to do ?
          1. Modal is already open
          2. Render new bank edit view
          3. bank edit view will handle future event (insert / update )
        */
        var movieModel = new Movie();
        var movieEditView = new MovieViewEdit({
            model: movieModel
        });
        $("#newMovieModal > div").html(movieEditView.render().el);
        $('.mdb-select').materialSelect();
    });
    // 2. Movies Event Listener
    Movies.on('add', function(movie) {
        console.log("new movie is added ");
        console.log(Movies.toJSON());
        // add to table the last bank
        movie.setSerialNo(movieSerialNo);
        movieSerialNo++;
        var movieView = new MovieViewRow({
            model: movie
        });
        $("#movieTable > tbody").append(movieView.render().el);
    });
    // 3. Movie Destroy Listener
    Movies.on('destroy', function(movie) {
        console.log(movie.get("name") + " is destroyed");
        movieSerialNo = 1;
        Movies.each(function(movie) {
            movie.setSerialNo(movieSerialNo);
            movieSerialNo++;
        })
    });
    // 4. Movie request foucs on modal input
    $("#newMovieModal").on('shown.bs.modal', requestMovieFormFocus);

    function requestMovieFormFocus(){
        $("#movieIdInput").focus();
        $(".fileSize").focus();
        $(".fileName").focus();
        $(".resolutionDuration").focus();
        $(".episdoeDescription").focus();
        $(".resolutionSelect").focus();
        $(".seasonDescriptionInput").focus();
        $(".seasonSelect").focus();
        $("#movieCategorySelect").focus();
        $("#moviePosterLandscapeInput").focus();
        $("#moviePosterPortraitInput").focus();
        $("#movieReleaseYearInput").focus();
        $("#movieDescriptionInput").focus();
        $("#movieNameInput").focus();
        $("#movieIdInput").focus();
    }










    // OLD Global Event Listeners


    // 1. New Bank Button Click
    $("#newBankButton").on("click", function() {
        console.log("newBankButton is clicked");
        /* what we have to do ?
          1. Modal is already open
          2. Render new bank edit view
          3. bank edit view will handle future event (insert / update )
        */
        var bankModel = new Bank();
        var bankEditView = new BankViewEdit({
            model: bankModel
        });
        $("#newBankModal > div").html(bankEditView.render().el);
    });
    // 2. Banks Event Listener
    Banks.on('add', function(bank) {
        console.log("new bank is added ");
        console.log(Banks.toJSON());
        // add to table the last bank
        bank.setSerialNo(bankSerialNo);
        bankSerialNo++;
        var bankView = new BankViewRow({
            model: bank
        });
        $("#bankTable > tbody").append(bankView.render().el);
    });
    // 3. Bank Destroy Listener
    Banks.on('destroy', function(bank) {
        console.log(bank.get("name") + " is destroyed");
        bankSerialNo = 1;
        Banks.each(function(bank) {
            bank.setSerialNo(bankSerialNo);
            bankSerialNo++;
        })
    });
    // 4. request foucs on modal input
    $("#newBankModal").on('shown.bs.modal', function() {
        $("#bankIdInput").focus();
        $("#bankNameInput").focus();
        $("#bankIdInput").focus();
    });


    
    // 5. New Currency Button Click
    $("#newCurrencyButton").on("click", function() {
        console.log("newCurrencyButton is clicked");
        var currencyModel = new Currency();
        var currencyEditView = new CurrencyViewEdit({
            model: currencyModel
        });
        $("#newCurrencyModal > div").html(currencyEditView.render().el);
    });
    // 6. Currencys Event Listener
    Currencys.on('add', function(currency) {
        console.log("new currency is added ");
        currency.setSerialNo(currencySerialNo);
        currencySerialNo++;
        var currencyView = new CurrencyViewRow({
            model: currency
        });
        $("#currencyTable > tbody").append(currencyView.render().el);
    });
    // 7. Currencys Destroy Listener
    Currencys.on('destroy', function(currency) {
        console.log(currency.get("name") + " is destroyed");
        currencySerialNo = 1;
        Currencys.each(function(currency) {
            currency.setSerialNo(currencySerialNo);
            currencySerialNo++;
        })
    });
    // 8. request foucs on currency modal input
    $("#newCurrencyModal").on('shown.bs.modal', function() {
        $("#currencyNameInput").focus();
        $("#currencyIdInput").focus();
    });
    // 9. New Account Button Click
    $("#newAccountButton").on("click", function() {
        console.log("newAccountButton is clicked");
        var accountModel = new Account();
        var accountEditView = new AccountViewEdit({
            model: accountModel
        });
        $("#newAccountModal > div").html(accountEditView.render().el);
        $('.mdb-select').materialSelect();
    });
    // 10. Accounts Event Listener
    Accounts.on('add', function(account) {
        console.log("new account is added ");
        account.setSerialNo(accountSerialNo);
        accountSerialNo++;
        var accountView = new AccountViewRow({
            model: account
        });
        $("#accountTable > tbody").append(accountView.render().el);
        var accountDashboardView = new AccountViewRowDashboard({
            model: account
        });
        $("#accountRowDashboardTable > tbody").append(accountDashboardView.render().el);
        // update account balance
        var data = account.toJSON();
        console.log("data from title json");
        console.log(data);
        var currency = data.currency.name;
        if (currency == "MMK") {
            total_balance_mmk += parseInt(data.balance);
            $("#total_balance_mmk").text("MMK : " + total_balance_mmk);
        }
        if (currency == "USD") {
            total_balance_usd += parseInt(data.balance);
            $("#total_balance_usd").text("USD : " + total_balance_usd);
        }
        if (currency == "EURO") {
            total_balance_euro += parseInt(data.balance);
            $("#total_balance_euro").text("Euro : " + total_balance_euro);
        }
    });
    // 11. Accounts Destroy Listener
    Accounts.on('destroy', function(account) {
        console.log(account.get("name") + " is destroyed");
        accountSerialNo = 1;
        Accounts.each(function(account) {
            account.setSerialNo(accountSerialNo);
            accountSerialNo++;
        });
    });
    // 12. Request focus on Account Modal Input
    $("#newAccountModal").on('shown.bs.modal', function() {
        $("#accountIdInput").focus();
        $("#accountCurrencySelect").focus().click();
        $("#accountBalanceInput").focus();
        $("#accountExchangeRateInput").focus();
        $("#accountNameInput").focus();
    });
    // 13. New auth Button Click
    $("#newAuthButton").on("click", function() {
        console.log("newAuthButton is clicked");
        var authModel = new Auth();
        var authEditView = new AuthViewEdit({
            model: authModel
        });
        $("#newAuthModal > div").html(authEditView.render().el);
    });
    // 14. Auth Event Listener
    Auths.on('add', function(auth) {
        console.log("new auth is added ");
        auth.setSerialNo(authSerialNo);
        authSerialNo++;
        var authView = new AuthViewRow({
            model: auth
        });
        $("#authTable > tbody").append(authView.render().el);
    });
    // 15. Auths Destroy Listener
    Auths.on('destroy', function(auth) {
        console.log(auth.get("name") + " is destroyed");
        authSerialNo = 1;
        Auths.each(function(auth) {
            auth.setSerialNo(authSerialNo);
            authSerialNo++;
        });
    });
    // 16. request foucs on auth modal input
    $("#newAuthModal").on('shown.bs.modal', function() {
        $("#authIdInput").focus();
        $("#authNameInput").focus();
    });
    // 17. New Title Button Click
    $("#newTitleButton").on("click", function() {
        console.log("newTitleButton is clicked");
        var titleModel = new Title();
        var titleEditView = new TitleViewEdit({
            model: titleModel
        });
        $("#newTitleModal > div").html(titleEditView.render().el);
        $('.mdb-select').materialSelect();
    });
    // 18. Titles Event Listener
    Titles.on('add', function(title) {
        console.log("new title is added ");
        title.setSerialNo(titleSerialNo);
        titleSerialNo++;
        var titleView = new TitleViewRow({
            model: title
        });
        $("#titleTable > tbody").append(titleView.render().el);
        var titleViewDashboard = new TitleViewRowDashboard({
            model: title
        });
        $("#titleRowDashboardTable > tbody").append(titleViewDashboard.render().el);
    });
    // 19. Accounts Destroy Listener
    Titles.on('destroy', function(title) {
        console.log(title.get("name") + " is destroyed");
        titleSerialNo = 1;
        Titles.each(function(title) {
            title.setSerialNo(titleSerialNo);
            titleSerialNo++;
        })
    });
    // 20. Request focus on Title Modal Input
    $("#newTitleModal").on('shown.bs.modal', function() {
        $("#titleIdInput").focus();
        $("#titleCalculationSelect").focus();
        $("#titleCurrencySelect").focus();
        $("#titleBalanceInput").focus();
        $("#titleTotalIncomeInput").focus();
        $("#titleTotalExpenseInput").focus();
        $("#titleOpeningDateInput").focus();
        $("#titleExchangeRatenput").focus();
        $("#titleNameInput").focus();
    });
    // 21. New Finance Button Click
    $("#newFinanceButton").on("click", function() {
        console.log("newFinanceButton is clicked");
        var financeModel = new Finance();
        var financeEditView = new FinanceViewEdit({
            model: financeModel
        });
        $("#newFinanceModal > div").html(financeEditView.render().el);
        $('.mdb-select').materialSelect();
        $('.datepicker').pickadate({
            format: 'yyyy/mm/dd',
            formatSubmit: 'yyyy/mm/dd',
        });
    });
    // 22. Finances Event Listener
    Finances.on('add', function(finance) {
        console.log("new finance is added ");
        console.log(finance);
        finance.setSerialNo(financeSerialNo);
        financeSerialNo++;
        var financeView = new FinanceViewRow({
            model: finance
        });
        $("#financeTable > tbody").append(financeView.render().el);
        $('[data-toggle="tooltip"]').tooltip();
        // update title total income / expense
        var data = finance.toJSON();
        console.log("data from finance json");
        console.log(data);
        var currency = data.title.currency.name;
        //alert("currency : "+currency);
        var ops = data.ops;
        if (currency == "MMK") {
            if (ops == "income") {
                total_income_mmk += parseInt(data.amount);
                $("#total_income_mmk").text("MMK : " + total_income_mmk);
            }
            if (ops == "expense") {
                total_expense_mmk += parseInt(data.amount);
                $("#total_expense_mmk").text("MMK : " + total_expense_mmk);
            }
        }
        if (currency == "USD") {
            if (ops == "income") {
                total_income_usd += parseInt(data.amount);
                $("#total_income_usd").text("USD : " + total_income_usd);
            }
            if (ops == "expense") {
                total_expense_usd += parseInt(data.amount);
                $("#total_expense_usd").text("USD : " + total_expense_usd);
            }
        }
        if (currency == "EURO") {
            //alert("here is euro");
            if (ops == "income") {
                total_income_euro += parseInt(data.amount);
                $("#total_income_euro").text("Euro : " + total_income_euro);
            }
            if (ops == "expense") {
                total_expense_euro += parseInt(data.amount);
                $("#total_expense_euro").text("Euro : " + total_expense_euro);
            }
        }
    });
    // 23. Finance Destroy Listener
    Finances.on('destroy', function(finance) {
        console.log(finance.get("description") + " is destroyed");
        financeSerialNo = 1;
        Finances.each(function(finance) {
            finance.setSerialNo(financeSerialNo);
            financeSerialNo++;
        })
    });
    Finances.on('reset', function(finance) {
        console.log("Finances is reset ");
        // reset all income and expense 
        total_income_mmk = 0;
        total_expense_mmk = 0;
        total_income_usd = 0;
        total_expense_usd = 0;
        total_income_euro = 0;
        total_expense_euro = 0;
        total_balance_mmk = 0;
        total_balance_usd = 0;
        total_balance_euro = 0;
        $("#total_income_mmk").text("MMK : " + total_income_mmk);
        $("#total_expense_mmk").text("MMK : " + total_expense_mmk);
        $("#total_income_usd").text("USD : " + total_income_usd);
        $("#total_expense_usd").text("USD : " + total_expense_usd);
        $("#total_income_euro").text("Euro : " + total_income_euro);
        $("#total_expense_euro").text("Euro : " + total_expense_euro);
        $("#total_balance_mmk").text("MMK : " + "N/A");
        $("#total_balance_usd").text("USD : " + "N/A");
        $("#total_balance_euro").text("Euro : " + "N/A");
        // update balance 
        // find for each account last balance 
        // Accounts.each(function(account){
        //   let account_id = account.get('id');
        //   console.log("account id is "+account_id);
        //   let finances = Finances.find(function(finance){
        //     return finance.get("account_id") == account_id;
        //   });
        //   console.log("finances for account_id "+account_id);
        //   console.log(finances);
        // });
        financeSerialNo = 1;
        Finances.each(function(finance) {
            console.log("financeSerialNo : " + financeSerialNo);
            finance.setSerialNo(financeSerialNo);
            financeSerialNo++;
            // update total income / expense
            var data = finance.toJSON();
            console.log("data from finance json");
            console.log(data);
            var currency = data.title.currency.name;
            //alert("currency : "+currency);
            var ops = data.ops;
            if (currency == "MMK") {
                if (ops == "income") {
                    total_income_mmk += parseInt(data.amount);
                    $("#total_income_mmk").text("MMK : " + total_income_mmk);
                }
                if (ops == "expense") {
                    total_expense_mmk += parseInt(data.amount);
                    $("#total_expense_mmk").text("MMK : " + total_expense_mmk);
                }
            }
            if (currency == "USD") {
                if (ops == "income") {
                    total_income_usd += parseInt(data.amount);
                    $("#total_income_usd").text("USD : " + total_income_usd);
                }
                if (ops == "expense") {
                    total_expense_usd += parseInt(data.amount);
                    $("#total_expense_usd").text("USD : " + total_expense_usd);
                }
            }
            if (currency == "EURO") {
                //alert("here is euro");
                if (ops == "income") {
                    total_income_euro += parseInt(data.amount);
                    $("#total_income_euro").text("Euro : " + total_income_euro);
                }
                if (ops == "expense") {
                    total_expense_euro += parseInt(data.amount);
                    $("#total_expense_euro").text("Euro : " + total_expense_euro);
                }
            }
        });
    });
    // 24. Request focus on Title Modal Input
    $("#newFinanceModal").on('shown.bs.modal', function() {
        $("#financeIdInput").focus();
        $("#financeAccountSelect").focus();
        $("#financeTitleSelect").focus();
        $("#financeAmountInput").focus();
        $("#financeExchangeRateInput").focus();
        $("#financeOpsSelect").focus();
        //$("#financeCreatedDateRateInput").focus();
        $("#financePaymentMethodSelect").focus();
        $("#financePaymentDataInput").focus();
        $("#financeAuthSelect").focus();
        $("#financeDescriptionInput").focus();
        $("#financeFromCompanyInput").focus();
        $("#financeFromAddressInput").focus();
        $("#financeFromPhoneInput").focus();
        $("#financeToNameInput").focus();
        $("#financeToCompanyInput").focus();
        $("#financeToAddressInput").focus();
        $("#financeToPhoneInput").focus();
        $("#financeFromNameInput").focus();
    });
    // 25. Calculate Trail Button Click Listener
    $("#trailCalculateForm").on('submit', function(e) {
        e.preventDefault();
        console.log("trailCalculateForm is submited");
        var start_date = $("#trailStartDateInput").val();
        var end_date = $("#trailEndDateInput").val();
        if (start_date == "") {
            toastr.warning("Start Date has to be provided");
            //$("#trailStartDateInput").focus();
            return;
        }
        if (end_date == "") {
            toastr.warning("End Date has to be provided");
            //$("#trailEndDateInput").focus();
            return;
        }
        /* 
          TDL : 
            check two date input for invalid interval choice or null
            such as 
              1. both start date and end date have to be filled
              2. the start date have to be smaller than end date
          AND
            1. submit via ajax request to get trail result for selected interval
            2. update / set the trail result model collection
        */
        showLoadingModal("Calculating trail for selected date range");
        console.log("start_date : " + start_date);
        console.log("end_date : " + end_date);
        // ajax is here :D
        var calculationFormData = new FormData();
        calculationFormData.append("ops_type", "trail");
        calculationFormData.append("jwt", thisIsJwt);
        calculationFormData.append("start_date", start_date);
        calculationFormData.append("end_date", end_date);
        $.ajax({
            url: calculationEndpoint,
            type: "post",
            data: calculationFormData,
            cache: false,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("calculation : trail  success");
                console.log(response);
                if (response.status) {
                    setTimeout(function() {
                        $("#trailTable > tbody").empty();
                        // append opeining balance
                        var openingBalanceAccount = response.data.openingBalanceAccount;
                        var serialNoForTrail = 1;
                        for (let account_id in openingBalanceAccount) {
                            console.log(account_id + " in " + openingBalanceAccount[account_id]);
                            var accountModel = Accounts.find(function(account) {
                                return account.get("id") == account_id;
                            });
                            $("#trailTable > tbody").append("<tr><td>" + serialNoForTrail + "</td><td>" + accountModel.get("name") + "</td><td>(opening balance)<td>" + openingBalanceAccount[account_id] + "</td></tr>");
                            serialNoForTrail++;
                        }
                        /* 
                          we have to combine two 

                        */
                        var incomeDataTitle = response.data.incomeDataTitle;
                        var expenseDataTitle = response.data.expenseDataTitle;
                        let income = incomeDataTitle;
                        let expense = expenseDataTitle;
                        let dataTitle = [];
                        for (let i = 0; i < income.length; i++) {
                            // find via income list 
                            let lonelyIncome = true;
                            console.log("finding expense for income i : " + i);
                            for (let j = 0; j < expense.length; j++) {
                                console.log("income " + i);
                                console.log(income[i]);
                                console.log("expense " + j);
                                console.log(expense[j]);
                                if (expense[j] == null) continue;
                                if (income[i].title_id == expense[j].title_id) {
                                    // combine data in dataTitle
                                    // delete expense.length by setting null
                                    let newTitle = {
                                        "title_id": income[i].title_id,
                                        "total_income": income[i].total_income,
                                        "total_expense": expense[j].total_expense
                                    };
                                    dataTitle[dataTitle.length] = newTitle;
                                    console.log("dataTitle is ");
                                    console.log(dataTitle);
                                    expense[j] = null;
                                    income[i] = null;
                                    lonelyIncome = false;
                                    j = expense.length; // halt the inner loop
                                }
                            }
                            if (lonelyIncome) {
                                console.log("income i is lonelyIncome ");
                                let newTitle = {
                                    "title_id": income[i].title_id,
                                    "total_income": income[i].total_income,
                                    "total_expense": 0
                                };
                                dataTitle[dataTitle.length] = newTitle;
                                income[i] = null;
                            }
                        }
                        for (let i = 0; i < expense.length; i++) {
                            if (expense[i] != null) {
                                let newTitle = {
                                    "title_id": expense[i].title_id,
                                    "total_income": 0,
                                    "total_expense": expense[i].total_expense
                                };
                                dataTitle[dataTitle.length] = newTitle;
                                income[i] = null;
                            }
                        }
                        for (let i = 0; i < dataTitle.length; i++) {
                            let titleObj = dataTitle[i];
                            var titleModel = Titles.find(function(title) {
                                return title.get("id") == titleObj.title_id;
                            })
                            $("#trailTable > tbody").append("<tr><td>" + serialNoForTrail + "</td><td>" + titleModel.get("name") + "</td><td>" + titleObj.total_income + "</td><td>" + titleObj.total_expense + "</td><td></td></tr>");
                            serialNoForTrail++;
                        }
                        // for(var i = 0 ; i < incomeDataTitle.length; i++){
                        //   let titleObj = incomeDataTitle[i];
                        //   $("#trailTable > tbody").append("<tr><td>"+serialNoForTrail+"</td><td>Title  : "+titleObj.title_id+"</td><td>"+titleObj.total_income+"</td><td></td></tr>");
                        // }
                        // for(var i = 0 ; i < expenseDataTitle.length; i++){
                        //   let titleObj = expenseDataTitle[i];
                        //   console.log("titleObj.total_expense "+titleObj.total_expense);
                        //   $("#trailTable > tbody").append("<tr><td>"+serialNoForTrail+"</td><td>Title  : "+titleObj.title_id+"</td><td>"+titleObj.total_expense+"</td><td></td></tr>");
                        // }
                        var closingBalanceAccount = response.data.closingBalanceAccount;
                        for (let account_id in closingBalanceAccount) {
                            console.log(account_id + " in " + closingBalanceAccount[account_id]);
                            var accountModel = Accounts.find(function(account) {
                                return account.get("id") == account_id;
                            });
                            $("#trailTable > tbody").append("<tr><td>" + serialNoForTrail + "</td><td>" + accountModel.get("name") + "</td><td>(Closing Balance)<td>" + closingBalanceAccount[account_id] + "</td></tr>");
                            serialNoForTrail++;
                        }
                        // openingBalanceAccount.forEach(function (balance, account_id) {
                        //   console.log('%d: %s', balance, account_id);
                        //   $("#trailTable > tbody").append("<tr><td>"+account_id+"</td><td>"+balance+"</td></tr>");
                        // });
                        // openingBalanceAccount.forEach(function(balance,account_id){
                        //   $("#trailTable > tbody").append("<tr><td>hello</td></tr>");
                        // });
                        //Currencys.add(response.data);
                        //alert("see in console ");
                        makeDataTable("trailTable");
                        hideLoadingModal();
                    }, 1000);
                } else {
                    console.log("there is no trail data :D");
                    hideLoadingModal();
                    $("#trailTable > tbody").html("<tr><td colspan='3'>There is no date to calculate trail.</td></tr>");
                    //alert("fail");
                }
            },
            error: function(response) {
                console.log(response);
                setTimeout(function() {
                    $("#trailTable > tbody").html("<tr><td colspan='3'>Trail Select Network Error : " + response.responseText + "</td></tr>");
                    //alert("Network Error");
                    hideLoadingModal();
                }, 1000);
            }
        });
        // setTimeout(function(){
        //   hideLoadingModal();
        // },2000);
    });
    // 26. Calculate Profit and Lose Listener
    $("#profitAndloseCalculateForm").on('submit', function(e) {
        e.preventDefault();
        console.log("profitAndLoseCalculateForm is submited");
        // date validation
        var start_date = $("#profitAndLoseStartDateInput").val();
        var end_date = $("#profitAndLoseEndDateInput").val();
        if (start_date == "") {
            toastr.warning("Start Date has to be provided");
            //$("#trailStartDateInput").focus();
            return;
        }
        if (end_date == "") {
            toastr.warning("End Date has to be provided");
            //$("#trailEndDateInput").focus();
            return;
        }
        // manipulating 
        showLoadingModal("Calculating Proft and Lose between  " + start_date + " and " + end_date);
        console.log("start_date : " + start_date);
        console.log("end_date : " + end_date);
        // ajax is here :D
        let calculationFormData = new FormData();
        calculationFormData.append("ops_type", "profit_and_lose");
        calculationFormData.append("jwt", thisIsJwt);
        calculationFormData.append("start_date", start_date);
        calculationFormData.append("end_date", end_date);
        $.ajax({
            url: calculationEndpoint,
            type: "post",
            data: calculationFormData,
            cache: false,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("calculation : profit_and_lose  success");
                console.log(response);
                $("#profitAndLoseTable > tbody").empty();
                if (response.status) {
                    let serialNo = 1;
                    if (response.data.length == 0) {
                        $("#profitAndLoseTable > tbody").append("<tr><td colspan='4'>There is no data to calculate prfit and loss </td></tr>");
                    }
                    for (let i = 0; i < response.data.length; i++) {
                        let profitObj = response.data[i];
                        let titleModel = Titles.find(function(title) {
                            return title.get('id') == profitObj.title_id;
                        })
                        $("#profitAndLoseTable > tbody").append("<tr><td>" + serialNo + "</td><td>" + titleModel.get("name") + "</td><td>" + profitObj.total_expense + "</td><td>" + profitObj.total_income + "</td><td>" + profitObj.status + "</td><td>" + profitObj.balance + "</td></tr>");
                        serialNo++;
                    }
                    makeDataTable("profitAndLoseTable");
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                } else {
                    $("#profitAndLoseTable > tbody").append("<tr><td colspan='4'>There is no data to calculate profit and lose</td></tr>");
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                }
            },
            error: function(response) {
                console.log("calculation : profit_and_lose error");
                console.log(response.responseText);
                $("#profitAndLoseTable > tbody").append("<tr><td colspan='4'>Network Error : " + response.responseText + "</td></tr>");
                setTimeout(function() {
                    hideLoadingModal();
                }, 1000);
            }
        });
    });
    // 27. Calculate Balance Sheet Listener
    $("#balanceSheetCalculateForm").on('submit', function(e) {
        e.preventDefault();
        console.log("balanceSheetCalculateForm is submited");
        // date validation
        var start_date = $("#balanceSheetStartDateInput").val();
        var end_date = $("#balanceSheetEndDateInput").val();
        if (start_date == "") {
            toastr.warning("Start Date has to be provided");
            //$("#trailStartDateInput").focus();
            return;
        }
        if (end_date == "") {
            toastr.warning("End Date has to be provided");
            //$("#trailEndDateInput").focus();
            return;
        }
        // manipulating 
        showLoadingModal("Calculating Balance Sheet  " + start_date + " and " + end_date);
        console.log("start_date : " + start_date);
        console.log("end_date : " + end_date);
        // ajax is here :D
        let calculationFormData = new FormData();
        calculationFormData.append("ops_type", "balance_sheet");
        calculationFormData.append("jwt", thisIsJwt);
        calculationFormData.append("start_date", start_date);
        calculationFormData.append("end_date", end_date);
        $.ajax({
            url: calculationEndpoint,
            type: "post",
            data: calculationFormData,
            cache: false,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("calculation : balance_sheet  success");
                console.log(response);
                $("#balanceSheetTable > tbody").empty();
                if (response.status) {
                    let serialNo = 1;
                    
                    for (let i = 0; i < response.data.length; i++) {
                        let balanceObj = response.data[i];
                        let titleModel = Titles.find(function(title) {
                            return title.get('id') == balanceObj.title_id;
                        })
                        $("#balanceSheetTable > tbody").append("<tr><td>" + serialNo + "</td><td>" + titleModel.get("name") + "</td><td>" + balanceObj.total_expense + "</td><td>" + balanceObj.total_income + "</td><td>" + balanceObj.balance + "</td></tr>");
                        serialNo++;
                    }
                    makeDataTable("balanceSheetTable");
                    if (response.data.length == 0) {
                        $("#balanceSheetTable > tbody").append("<tr><td colspan='4'>There is no data to calculate balance sheet</td></tr>");
                    }
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                } else {
                    $("#balanceSheetTable > tbody").append("<tr><td colspan='4'>There is no data to calculate balance sheet</td></tr>");
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                }
            },
            error: function(response) {
                console.log("calculation : balance_sheet error");
                console.log(response.responseText);
                $("#balanceSheetTable > tbody").append("<tr><td colspan='4'>Network Error : " + response.responseText + "</td></tr>");
                setTimeout(function() {
                    hideLoadingModal();
                }, 1000);
            }
        });
    });
    $("#dashboardSubmit").on("click", function(e) {
        console.log("dashboardEndDate is clicked");
        // date validation
        var start_date = $("#dashboardStartDate").val();
        var end_date = $("#dashboardEndDate").val();
        if (start_date == "") {
            toastr.warning("Start Date has to be provided");
            //$("#trailStartDateInput").focus();
            return;
        }
        if (end_date == "") {
            toastr.warning("End Date has to be provided");
            //$("#trailEndDateInput").focus();
            return;
        }
        // TDL:
        // compare date between
        /*
          what we have to do,
          just query the finance for ops = income,expense : created_date = between start date and end date that the user choose

          OR

          just filter the Finance Collection :D 
          may be it's bad practice since all the data need more memory for client site

        */
        // manipulating 
        showLoadingModal("Getting data from  " + start_date + " to " + end_date);
        console.log("start_date : " + start_date);
        console.log("end_date : " + end_date);
        // ajax is here :D
        let dashboardFormData = new FormData();
        dashboardFormData.append("ops_type", "dashboard");
        dashboardFormData.append("jwt", thisIsJwt);
        dashboardFormData.append("start_date", start_date);
        dashboardFormData.append("end_date", end_date);
        $.ajax({
            url: financeEndpoint,
            type: "post",
            data: dashboardFormData,
            cache: false,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("finance : dashboard  success");
                console.log(response);
                if (response.status) {
                    // we just need to update the collection
                    let serialNo = 1;
                    if (response.data.length == 0) {
                        Finances.reset();
                    } else {
                        Finances.reset(response.data);
                    }
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                } else {
                    setTimeout(function() {
                        hideLoadingModal();
                    }, 1000);
                }
            },
            error: function(response) {
                console.log("finance : dashboard error");
                console.log(response.responseText);
                setTimeout(function() {
                    hideLoadingModal();
                }, 1000);
            }
        });
    });
    
    // 29. New User Button Click
    $("#newUserButton").on("click", function() {
        console.log("newUserButton is clicked");
        var userModel = new User();
        var userEditView = new UserViewEdit({
            model: userModel
        });
        $("#newUserModal > div").html(userEditView.render().el);
        $('.mdb-select').materialSelect();
    });
    // 30. Users Event Listener
    Users.on('add', function(user) {
        console.log("new user is added ");
        console.log(Users.toJSON());
        // add to table the last bank
        user.setSerialNo(userSerialNo);
        userSerialNo++;
        let userView = new UserViewRow({
            model: user
        });
        $("#userTable > tbody").append(userView.render().el);
    });
    // 31. User Destroy Listener
    Users.on('destroy', function(user) {
        console.log(user.get("name") + " is destroyed");
        userSerialNo = 1;
        Users.each(function(user) {
            user.setSerialNo(userSerialNo);
            userSerialNo++;
        })
    });
    // 4. request foucs on modal input
    $("#newUserModal").on('shown.bs.modal', function() {
        $("#userIdInput").focus();
        $("#userPasswordInput").focus();
        $("#userRoleSelect").focus();
        $("#userPersonalDataInput").focus();
        $("#userNameInput").focus();
    });

    // 32. hash change
    console.log(window.location.hash);
    let link = window.location.hash;
    link = link.substring(1);
    console.log(link);
    $('section').hide();
    if (link == "") {
        // we have to show landing section
        //link = "landingSection";
        link = "categorySection";
    }
    $("#" + link).show();
    console.log('28 has change is starting..');
    $(window).on('hashchange', function(e) {
        console.log('hash changed');
        console.log(window.location.hash);
        let link = window.location.hash;
        link = link.substring(1);
        console.log(link);
        $('section').hide();
        $("#" + link).show();
    });
    //////////////////////////////////////////////////////////////////////////
    // Loading initial data to fill up Global Data
    // prepare to ui


    $("#categoryTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Category data from server...</td></tr>");
    $("#seasonTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Season data from server...</td></tr>");
    $("#resolutionTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Resolution data from server...</td></tr>");
    $("#movieTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Movie data from server...</td></tr>");
    



    $("#bankTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Bank data from server...</td></tr>");
    $("#currencyTable > tbody").html("<tr><td colspan='3'>Getting Currency data from server....</td></tr>");
    $("#accountTable > tbody").html("<tr><td colspan='3'>Getting Account data from server....</td></tr>");
    $("#authTable > tbody").html("<tr><td colspan='3'>Getting Auth data from server....</td></tr>");
    $("#titleTable > tbody").html("<tr><td colspan='3'>Getting Title data from server....</td></tr>");
    $("#financeTable > tbody").html("<tr><td colspan='3'>Getting Finance data from server....</td></tr>");
    $("#titleRowDashboardTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Title data from server...</td></tr>");
    // accountRowDashboardTable
    $("#accountRowDashboardTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting Bank Account data from server...</td></tr>");
    $("#userTable > tbody").html("<tr><td colspan='3'><img src='img/mdb-transaprent-noshadows.png' class='animated slow flash infinite' alt='Transparent MDB Logo'> Getting User data from server...</td></tr>");
    
    
    
    // getting data from server

    var categoryDataList = [];
    var categoryFormData = new FormData();
    //categoryFormData.append("ops_type", "select");
    //categoryFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: categorySelectEndpoint,
        type: "post",
        data: categoryFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#categoryTable > tbody").empty();
                    Categorys.add(response.data);
                    makeDataTable("categoryTable");
                    if (response.data.length == 0) $("#categoryTable > tbody").html("<tr><td colspan='3'>There is no Banks on server. Please add new Category.</td></tr>");
                    //$("#bankTable").DataTable();
                    for(let i=0; i < response.data.length; i++){
                        categoryDataList.push(response.data[i]);
                    }
                    console.log('categoryDataList is ');
                    console.log(categoryDataList);
                }, 1000);
            } else {
                console.log("there is no category :D");
                $("#categoryTable > tbody").html("<tr><td colspan='3'>There is no Banks on server.Please add new category.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#categoryTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });

    
    var seasonDataList = [];
    var seasonFormData = new FormData();
    $.ajax({
        url: seasonSelectEndpoint,
        type: "post",
        data: seasonFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#seasonTable > tbody").empty();
                    Seasons.add(response.data);
                    makeDataTable("seasonTable");
                    if (response.data.length == 0) $("#seasonTable > tbody").html("<tr><td colspan='3'>There is no Banks on server. Please add new season.</td></tr>");
                    //$("#bankTable").DataTable();
                    for(let i=0; i < response.data.length; i++){
                        seasonDataList.push(response.data[i]);
                    }
                    console.log('seasonDataList is ');
                    console.log(seasonDataList);
                }, 1000);
            } else {
                console.log("there is no season :D");
                $("#seasonTable > tbody").html("<tr><td colspan='3'>There is no Banks on server.Please add new season.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#seasonTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });


    var resolutionDataList = [];
    var resolutionFormData = new FormData();
    //resolutionFormData.append("ops_type", "select");
    //resolutionFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: resolutionSelectEndpoint,
        type: "post",
        data: resolutionFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("resolution response is ");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#resolutionTable > tbody").empty();
                    Resolutions.add(response.data);
                    makeDataTable("resolutionTable");
                    if (response.data.length == 0) $("#resolutionTable > tbody").html("<tr><td colspan='3'>There is no Banks on server. Please add new Resolution.</td></tr>");
                    //$("#bankTable").DataTable();
                    for(let i=0; i < response.data.length; i++){
                        resolutionDataList.push(response.data[i]);
                    }
                    console.log('resolutionDataList is ');
                    console.log(resolutionDataList);
                }, 1000);
            } else {
                console.log("there is no resolution :D");
                $("#resolutionTable > tbody").html("<tr><td colspan='3'>There is no Banks on server.Please add new resolution.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#resolutionTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });


    var movieFormData = new FormData();
    $.ajax({
        url: movieSelectEndpoint,
        type: "post",
        data: movieFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#movieTable > tbody").empty();
                    Movies.add(response.data);
                    makeDataTable("movieTable");
                    if (response.data.length == 0) $("#movieTable > tbody").html("<tr><td colspan='3'>There is no Banks on server. Please add new Movie.</td></tr>");
                    //$("#bankTable").DataTable();
                }, 1000);
            } else {
                console.log("there is no movie :D");
                $("#movieTable > tbody").html("<tr><td colspan='3'>There is no Movie on server.Please add new movie.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#movieTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });

    var bankFormData = new FormData();
    bankFormData.append("ops_type", "select");
    bankFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: bankEndpoint,
        type: "post",
        data: bankFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#bankTable > tbody").empty();
                    Banks.add(response.data);
                    makeDataTable("bankTable");
                    if (response.data.length == 0) $("#bankTable > tbody").html("<tr><td colspan='3'>There is no Banks on server. Please add new bank.</td></tr>");
                    //$("#bankTable").DataTable();
                }, 1000);
            } else {
                console.log("there is no bank :D");
                $("#bankTable > tbody").html("<tr><td colspan='3'>There is no Banks on server.Please add new bank.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#bankTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });


    var currencyFormData = new FormData();
    currencyFormData.append("ops_type", "select");
    currencyFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: currencyEndpoint,
        type: "post",
        data: currencyFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("currency select success");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#currencyTable > tbody").empty();
                    Currencys.add(response.data);
                    makeDataTable("currencyTable");
                    if (response.data.length == 0) $("#currencyTable > tbody").html("<tr><td colspan='3'>There is no Currency on server. Please add new currency.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no currency :D");
                $("#currencyTable > tbody").html("<tr><td colspan='3'>There is no Currency on server.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#currencyTable > tbody").html("<tr><td colspan='3'>Currency Select Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    var accountFormData = new FormData();
    accountFormData.append("ops_type", "select");
    accountFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: accountEndpoint,
        type: "post",
        data: accountFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("account select success");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#accountTable > tbody").empty();
                    // $("#accountRowDashboardTable > tbody")
                    $("#accountRowDashboardTable > tbody").empty();
                    Accounts.add(response.data);
                    makeDataTable("accountTable");
                    makeDataTable("accountRowDashboardTable");
                    if (response.data.length == 0) $("#accountTable > tbody").html("<tr><td colspan='3'>There is no Accounts on server. Please add new account.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no account :D");
                $("#accountTable > tbody").html("<tr><td colspan='3'>There is no Account on server.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#accountTable > tbody").html("<tr><td colspan='3'>Account Select Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    var authFormData = new FormData();
    authFormData.append("ops_type", "select");
    authFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: authEndpoint,
        type: "post",
        data: authFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("auth select success");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#authTable > tbody").empty();
                    Auths.add(response.data);
                    makeDataTable("authTable");
                    if (response.data.length == 0) $("#authTable > tbody").html("<tr><td colspan='3'>There is no Auth Person on server. Please add new Auth Person.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no auth :D");
                $("#authTable > tbody").html("<tr><td colspan='3'>There is no Auth on server.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#authTable > tbody").html("<tr><td colspan='3'>Auth Select Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    var titleFormData = new FormData();
    titleFormData.append("ops_type", "select");
    titleFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: titleEndpoint,
        type: "post",
        data: titleFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("title select success");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#titleTable > tbody").empty();
                    $("#titleRowDashboardTable > tbody").empty();
                    Titles.add(response.data);
                    makeDataTable("titleTable");
                    makeDataTable("titleRowDashboardTable");
                    if (response.data.length == 0) $("#titleTable > tbody").html("<tr><td colspan='3'>There is no Title on server. Please add new Title.</td></tr>");
                    if (response.data.length == 0) $("#titleRowDashboardTable > tbody").html("<tr><td colspan='3'>There is no Title on server. Please add new Title.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no Title :D");
                $("#titleTable > tbody").html("<tr><td colspan='3'>There is no Title on server.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#titleTable > tbody").html("<tr><td colspan='3'>Title Select Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    var financeFormData = new FormData();
    financeFormData.append("ops_type", "select");
    financeFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: financeEndpoint,
        type: "post",
        data: financeFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("finance select success");
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#financeTable > tbody").empty();
                    Finances.add(response.data);
                    makeDataTable("financeTable");
                    if (response.data.length == 0) $("#financeTable > tbody").html("<tr><td colspan='3'>There is no Finance on server. Please add new Finance.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no Finance :D");
                $("#financeTable > tbody").html("<tr><td colspan='3'>There is no Finance on server.</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#financeTable > tbody").html("<tr><td colspan='3'>Finance Select Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    let userFormData = new FormData();
    userFormData.append("ops_type", "select");
    userFormData.append("jwt", thisIsJwt);
    $.ajax({
        url: userEndpoint,
        type: "post",
        data: userFormData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            if (response.status) {
                setTimeout(function() {
                    $("#userTable > tbody").empty();
                    Users.add(response.data);
                    makeDataTable("userTable");
                    if (response.data.length == 0) $("#userTable > tbody").html("<tr><td colspan='3'>There is no Users on server. Please add new user.</td></tr>");
                }, 1000);
            } else {
                console.log("there is no user :D");
                $("#userTable > tbody").html("<tr><td colspan='3'>Data : "+response.data+"</td></tr>");
            }
        },
        error: function(response) {
            console.log(response);
            setTimeout(function() {
                $("#bankTable > tbody").html("<tr><td colspan='3'>Network Error : " + response.responseText + "</td></tr>");
            }, 1000);
        }
    });
    // updating report card
    /* socket section */
    socket.on('finance', (data) => {
        console.log("SOCKET : finance is received from server");
        console.log(data);
        let msg = "New finance is added.";
        /* discuss here how to parse finance */
        // Data Manipulation
        let orgData = Finances.find(function(finance) {
            return finance.get("id") == data.id;
        });
        let orgAccount = Accounts.find(function(account) {
            return account.get("id") == data.account_id;
        });
        var orgTitle = Titles.find(function(title) {
            return title.get("id") == data.title_id;
        });
        msg = "Notification : ";
        if (orgData === undefined) {
            console.log("financeIdInput id cannot find id " + data.id);
            msg += data.description + " is added";
            Finances.add(data);
            orgAccount.set(data.account); // magic is in the air :D
            orgTitle.set(data.title);
        } else {
            msg = data.description + " is updated";
            orgData.set(data);
            $('[data-toggle="tooltip"]').tooltip();
        }
        toastr.info(msg);
        // we have to update the balance 
        // since income and expense is calculate via data
        let currency = data.title.currency.name;
        // update Balance
        console.log("currency  " + currency);
        if (currency == "MMK") {
            total_balance_mmk += parseInt(data.amount);
            $("#total_balance_mmk").text("MMK : " + total_balance_mmk);
        }
        if (currency == "USD") {
            total_balance_usd += parseInt(data.amount);
            $("#total_balance_usd").text("USD : " + total_balance_usd);
        }
        if (currency == "EURO") {
            total_balance_euro += parseInt(data.amount);
            $("#total_balance_euro").text("Euro : " + total_balance_euro);
        }
        // console.log("currency and ops from socket data is "+currency+" and "+ops);
        // if(currency == "MMK"){
        //   if(ops == "income"){
        //     total_income_mmk += parseInt(data.amount);
        //     $("#total_income_mmk").text("MMK : "+total_income_mmk);
        //   }
        //   if(ops == "expense"){
        //     total_expense_mmk += parseInt(data.amount);
        //     $("#total_expense_mmk").text("MMK : "+total_expense_mmk);
        //   }
        // }
        // if(currency == "USD"){
        //   if(ops == "income"){
        //     total_income_usd += parseInt(data.amount);
        //     $("#total_income_usd").text("USD : "+total_income_usd);
        //   }
        //   if(ops == "expense"){
        //     total_expense_usd += parseInt(data.amount);
        //     $("#total_expense_usd").text("USD : "+total_expense_usd);
        //   }
        // }
        // if(currency == "EURO"){
        //   //alert("here is euro");
        //   if(ops == "income"){
        //     total_income_euro += parseInt(data.amount);
        //     $("#total_income_euro").text("Euro : "+total_income_euro);
        //   }
        //   if(ops == "expense"){
        //     total_expense_euro += parseInt(data.amount);
        //     $("#total_expense_euro").text("Euro : "+total_expense_euro);
        //   }
        // }
    });
    /* test case */
    /* model test 

    var innwa = new Bank({"name":"innwa","id":56});
    //var view = new ThankView({ model: newThank });
    //$('#thanks_ul').prepend( view.render().el );
    var innwaView = new BankViewRow({ model : innwa });
    $("#bankTable > tbody").append(innwaView.render().el);
    console.log(innwa);
    innwa.setName("mwd");
    innwa.setSerialNo(2);
    console.log(innwa);
    console.log(innwa.get("name"));
    console.log(innwa.id);
    */
    /*
      Thanks.reset(JSON.parse(localStorage.getItem("Thanks")));
      Thanks.each(function(thank) {
          var view = new ThankView({ model: thank });
          $('#thanks_ul').prepend( view.render().el );
                  });

    */
    //Banks = new BankList(BankData);
    //Banks.reset(BankData);
    /*
    Banks.each(function(bank){
      bank.setSerialNo(bankSerialNo);
      bankSerialNo++;
      var bankView = new BankViewRow({ model : bank });
      $("#bankTable > tbody").append(bankView.render().el);
    });
    */
    /* test case : END */
    //Banks.add(new Bank());
    // find only return first 
    /* find function testing
    var newModel = Banks.find(function(bank){
      return bank.get("id") == 1;
    })
    if(newModel === undefined){
      console.log("id is not found ");
    } else{
      console.log("newModel is ");
      console.log(newModel);
      //newModel.setSerialNo(34);
      var newData = {"id":34,"name":"newData"};
      newModel.set(newData);
      
      //Banks.remove(newModel);
      //console.log(Banks.length);
      // may be add or 
      //Banks.add(newModel);
      //console.log(Banks.length);
    }
    */
});


/*
defaults: {
            id: null,
            serial_no: null,
            name: "Avatar",
            description: "Avatar Description blah blah blah",
            poster_portrait: "photo_two",
            poster_landscape: "photo_one",
            release_year: "2009",
            movie_type: "2",
            category: [
                {
                    id: 2,
                    name: "comedy"
                },
                {
                    id: 1,
                    name: "action"
                }
            ],
            season_list: [
                {
                    id: 3,
                    season: "one",
                    season_description: "Rise on Walking Dead",
                    resolution_list: [
                        {
                            id: 1,
                            resolution: "zero",
                            duration: "105",
                            resolution_description: "Sun Down",
                            file_list: [
                                {
                                    id: 13,
                                    name: "file4k.mp4",
                                    size: "2350",
                                    resolution: "720p"
                                },
                                {
                                    id: 14,
                                    name: "file4k.mp4",
                                    size: "3350",
                                    resolution: "1080p"
                                }
                            ]
                        },
                        {
                            id: 2,
                            resolution: "two",
                            duration: "123",
                            resolution_description: "Sun Up",
                            file_list: [
                                {
                                    id: 13,
                                    name: "file4k.mp4",
                                    size: "2350",
                                    resolution: "720p"
                                },
                                {
                                    id: 14,
                                    name: "file4k.mp4",
                                    size: "3350",
                                    resolution: "1080p"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
*/
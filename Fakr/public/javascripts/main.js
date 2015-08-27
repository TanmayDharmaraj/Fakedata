var FakeData = FakeData || {};
FakeData.app = (function ($) {
    
    function DataModel(data) {
        var self = this;
        self.Key = ko.observable(data.Key);
        self.DataType = ko.observable(data.DataType);
    }
    
    function ViewModel() {
        var self = this;
        
        self.availableDataType = [
            { DataType: "Integer", Symbol: "INT" },
            { DataType: "Float", Symbol: "FLT" },
            { DataType: "First Name", Symbol: "FN" },
            { DataType: "Last Name", Symbol: "LN" },
            { DataType: "Gender", Symbol: "GDR" },
            { DataType: "Birthday", Symbol: "BD" },
            { DataType: "Phone", Symbol: "PHN" },
            { DataType: "Zip", Symbol: "ZIP" },
            { DataType: "Word", Symbol: "WRD" },
            { DataType: "Paragraph", Symbol: "PARA" },
            { DataType: "Coordinates", Symbol: "CORD" }
        ];
        self.JsonKeyValue = ko.observableArray([
            new DataModel({ Key : "", DataType : "" }),
            new DataModel({ Key : "", DataType : "" }),
            new DataModel({ Key : "", DataType : "" })
        ]);
        
        self.AddJsonKeyValue = function () {
            self.JsonKeyValue.push(new DataModel({
                Key : this.JsonKey,
                DataType : this.DataType
            }));
        };
        
        self.DeleteJsonKeyValue = function (data) {
            self.JsonKeyValue.remove(data)
        };
        
        self.GeneratePreview = function () {
            var filteredArray = FakeData.JsonService.MakeJSON(self.JsonKeyValue(), { DataType: false });
            var str = syntaxHighlight(JSON.stringify(filteredArray, undefined, 4));
            $("#JsonOutput>pre").html(str);
        };
        self.FakeIt = function () {
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(self.JsonKeyValue(), { DataType: true });
            d.reps = document.getElementById("Reps").value;
            if ($.isEmptyObject(d.json)) {
                toastr.warning('Our servers cannot tolerate blank data.', 'Mercy !');
                return
            }
            else {
                $.ajax({
                    url: '/api/Fakrs',
                    contentType: 'application/json',
                    type: 'POST',
                    data: JSON.stringify(d),
                    success: function (d) {
                        if (d.data) {
                            var url = location.href + "d/" + d.data.unique_id
                            $("#workspace .row").removeClass("show").addClass("hide");
                            $("#workspace").append("<div id='link_output'><p class='lead text-center'><a href=" + url + ">" + url + "</a></p></div>");
                        }
                        else {
                            toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Oops! :-(');
                        }
                    },
                    error: function (err) {
                        toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                        console.log(err)
                    }
                });
            }
        };
        
        self.FakeIt_Edit_Get = function () {
            var obj = {};
            obj.data_type = true;
            obj.url = $("#fakr_url").val();
            $.ajax({
                url: '/api/Fakrs?data_type=' + obj.data_type + "&url=" + obj.url,
                type: 'GET',
                contentType: 'application/json',
                success: function (data) {
                    if (data) {
                        //reset workspace to base view
                        $("#workspace>#link_output").remove();
                        $("#workspace .row").removeClass("hide").addClass("show");
                        
                        data = data[0];
                        self.JsonKeyValue.removeAll();
                        $.each(data, function (key, value) {
                            var length = self.availableDataType.length;
                            var dt = null;
                            for (var i = 0; i < length; i++) {
                                if (self.availableDataType[i].Symbol === value) {
                                    dt = self.availableDataType[i];
                                }
                            }
                            self.JsonKeyValue.push(new DataModel({
                                Key : key,
                                DataType : dt
                            }));                      
                        });
                        self.GeneratePreview();
                    }
                },
                error: function (err) {
                    toastr.error('We couldn&apos;t find data related to that URL', 'Oops! :-(')
                    console.log(err)
                }
            });
        };

        self.FakeIt_Edit_Put = function () { 
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(self.JsonKeyValue(), { DataType: true });
            d.reps = document.getElementById("Reps").value;
            d.url = $("#fakr_url").val();

            if ($.isEmptyObject(d.json)) {
                toastr.warning('Our servers cannot tolerate blank data.', 'Mercy !');
                return
            }
            else {
                $.ajax({
                    url: '/api/Fakrs',
                    contentType: 'application/json',
                    type: 'PUT',
                    data: JSON.stringify(d),
                    success: function (d) {
                        if (d.data) {
                            toastr.success("Your data has been updated successfully", "Awesome !");
                        }
                        else {
                            toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Oops! :-(');
                        }
                    },
                    error: function (err) {
                        toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                        console.log(err)
                    }
                });
            }
        };
    }
    
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    $(document).ready(function () {
        //only numbers allowed for Reps
        $("#Reps").keypress(function (e) {
            //if the letter is not digit then display error and don't type anything
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                //display error message
                toastr.error("Digits Only","Oop :-(")
                return false;
            }

        });
        
        $("#btnEditPreviousJSON").click(function (e) {
            e.preventDefault();
            $("#edit_fakr").slideToggle("fast");
            //hide the fake it button to show update button
            $("#FakeIt").toggle()
            $("#FakeIt_Update").toggle()
        });
        
        ko.applyBindings(new ViewModel())
    })
})($);

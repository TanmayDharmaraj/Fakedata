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
            $("#JsonOutput").html("<pre class='prettyprint'>" + JSON.stringify(filteredArray, undefined, 4) + "</pre>");
            prettyPrint();
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
                            var url = location.href + d.data.unique_id
                            $('#workspace').html("<p class='lead text-center'><a href=" + url + ">" + url + "</a></p>");
                        }
                        else {
                            toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Oops! :-(');
                        }
                    },
                    error: function (err) {
                        toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                        console.log(err)
                    }
                })
            }           
        };

        self.FakeIt_Edit = function () { 
            console.log($("#fakr_url").value);
        };
    }
    
    
    $(document).ready(function () {
        
        $("#JsonInput>textarea").keydown(function () {
            var keyCode = e.keyCode || e.which;
            //Space Key
            if (keyCode == 9) {
                e.preventDefault();
                var start = $(this).get(0).selectionStart;
                var end = $(this).get(0).selectionEnd;
                
                // set textarea value to: text before caret + tab + text after caret
                $(this).val($(this).val().substring(0, start) 
				+ "\t" 
				+ $(this).val().substring(end));
                
                // put caret at right position again
                $(this).get(0).selectionStart =
			$(this).get(0).selectionEnd = start + 1;
            }
        });
        //only numbers allowed for Reps
        $("#Reps").keypress(function (e) {
            //if the letter is not digit then display error and don't type anything
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                //display error message
                $("#errmsg").html("Digits Only").show().fadeOut("slow");
                return false;
            }
        });
        
        $("#JsonInput>textarea").keyup(function (e) {
            $("#JsonOutput").html("<pre class='prettyprint'>" + $(this).val() + "</pre>");
            prettyPrint();
            $(this).focus()
        })
        ko.applyBindings(new ViewModel())
    })
})($);

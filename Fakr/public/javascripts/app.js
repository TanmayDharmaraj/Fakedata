(function () {
    var app = angular.module("fakr", []);
    app.controller('FakeController', function ($http, $scope) {
        var scope = this;
        scope.DataTypes = [];
        scope.isEditPreviousJsonClicked = false;
        scope.toggle = function () {
            
            this.isEditPreviousJsonClicked = !this.isEditPreviousJsonClicked;
        };
        scope.JsonKeyValues = [
            { Key : "", DataType : "" },
            { Key : "", DataType : "" },
            { Key : "", DataType : "" }
        ];
        scope.DeleteJsonKeyValue = function (index) {
            this.JsonKeyValues.splice(index, 1);
        };
        scope.AddJsonKeyValue = function () {
            this.JsonKeyValues.push({ Key : "", DataType : "" });
        };
        
        scope.GeneratePreview = function (fakeCtrl) {
            var filteredArray = FakeData.JsonService.MakeJSON(scope.JsonKeyValues, { DataType: false });
            var str = FakeData.Helper.SyntaxHiglight(JSON.stringify(filteredArray, undefined, 4));
            $("#JsonOutput>pre").html(str);
        };
        scope.FakeIt = function () { 
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(scope.JsonKeyValues, { DataType: true });
            d.reps = document.getElementById("Reps").value;
            if ($.isEmptyObject(d.json)) {
                toastr.warning('Our servers cannot tolerate blank data.', 'Mercy !');
                return
            }
            var request = $http({
                method: "post",
                url: "/api/Fakrs",
                data: d
            });
            request.success(function (d) {
                if (d.data) {
                    var url = location.href + "d/" + d.data.unique_id
                    $("#workspace .row").removeClass("show").addClass("hide");
                    $("#workspace").append("<div id='link_output'><p class='lead text-center'><a href=" + url + ">" + url + "</a></p></div>");
                }
                else {
                    toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Oops! :-(');
                }
            });
            request.error(function (err) {
                toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                console.log(err)
            });
        };
        scope.UpdateFake = function () { 
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(scope.JsonKeyValues, { DataType: true });
            d.reps = document.getElementById("Reps").value;
            d.url = $("#fakr_url").val();
            
            if ($.isEmptyObject(d.json)) {
                toastr.warning('Our servers cannot tolerate blank data.', 'Mercy !');
                return
            }
            else {
                var request = $http({
                    method: 'PUT',
                    url: '/api/Fakrs',
                    data: d
                });
                
                request.success(function (d) {
                    if (d.data) {
                        toastr.success("Your data has been updated successfully", "Awesome !");
                    }
                    else {
                        toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Oops! :-(');
                    }
                });
                request.error(function (err) {
                    toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                    console.log(err)
                });
            }
        };
        
        scope.GetFake = function() { 
            var obj = {};
            obj.data_type = true;
            obj.url = $("#fakr_url").val();
            var request = $http.get('/api/Fakrs?data_type=' + obj.data_type + "&url=" + obj.url)
            request.success(function (data) {
                if (data) {
                    //reset workspace to base view
                    $("#workspace>#link_output").remove();
                    $("#workspace .row").removeClass("hide").addClass("show");
                    
                    data = data[0];
                    scope.JsonKeyValues = [];
                    $.each(data, function (key, value) {
                        var length = scope.DataTypes.length;
                        var dt = null;
                        for (var i = 0; i < length; i++) {
                            if (scope.DataTypes[i].Symbol === value) {
                                dt = scope.DataTypes[i];
                            }
                        }
                        scope.JsonKeyValues.push({
                            Key : key,
                            DataType : dt
                        });
                    });
                    self.GeneratePreview();
                }
            });
            request.error(function (err) {
                toastr.error('We couldn&apos;t find data related to that URL', 'Oops! :-(')
                console.log(err)
            });
        };
        
        $http.get('/api/data-types').success(function (data) {
            console.log(this.DataTypes);
            scope.DataTypes = data; console.log(data);
        })
    });
})();
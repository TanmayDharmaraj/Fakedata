﻿angular.module('MainCtrl', []).controller('MainController', ['$scope', '$http', function ($scope, $http) {
        var self = this;
        self.DataTypes = [];
        self.isEditPreviousJsonClicked = false;
        self.FakeName = "";
        self.Reps = null;
        
        self.toggle = function () {
            
            this.isEditPreviousJsonClicked = !this.isEditPreviousJsonClicked;
        };
        self.JsonKeyValues = [
            { Key : "", DataType : "" },
            { Key : "", DataType : "" },
            { Key : "", DataType : "" }
        ];
        self.DeleteJsonKeyValue = function (index) {
            this.JsonKeyValues.splice(index, 1);
        };
        self.AddJsonKeyValue = function () {
            this.JsonKeyValues.push({ Key : "", DataType : "" });
        };
        
        self.GeneratePreview = function (fakeCtrl) {
            var filteredArray = FakeData.JsonService.MakeJSON(self.JsonKeyValues, { DataType: false });
            var str = FakeData.Helper.SyntaxHiglight(JSON.stringify(filteredArray, undefined, 4));
            $("#JsonOutput>pre").html(str);
        };
        self.FakeIt = function () {
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(self.JsonKeyValues, { DataType: true });
            d.reps = self.Reps;
            d.name = self.FakeName;
            if ($.isEmptyObject(d.json)) {
                toastr.warning('Our servers cannot tolerate blank data.', 'Mercy !');
                return
            }
            var request = $http({
                method: "post",
                url: "/api/v1/fakes",
                data: d
            });
            request.success(function (d) {
                if (d.error == null) {
                    toastr.success("Record created successfully","Awesome!");
                   /* var url = location.href + "api/v1/fakes/" + d.data.unique_id
                    $("#workspace .row").removeClass("show").addClass("hide");
                    $("#workspace").append("<div id='link_output'><p class='lead text-center'><a href=" + url + ">" + url + "</a></p></div>");*/
                }
                else {
                    toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Mercy !');
                }
            });
            request.error(function (err,status) {
                if(status == 403){
                    toastr.error(err.error.message,'Hey!');
                    console.log(err,status);
                }
                else{
                    toastr.error('You tried something that we didn\'t expect', 'That\'s embarassing!')
                    console.log(err,status)    
                }
            });
        };
        self.UpdateFake = function () {
            var d = {};
            d.json = FakeData.JsonService.MakeJSON(self.JsonKeyValues, { DataType: true });
            d.name = self.FakeName;
            d.reps = self.Reps;
            d.url = $("#fakr_url").val();
            
            if ($.isEmptyObject(d.json)) {
                toastr.warning('You probably sent blank data which resulted in the server rejecting your request.', 'Mercy !');
                return
            }
            else {
                var request = $http({
                    method: 'PUT',
                    url: '/api/v1/fakes',
                    data: d
                });
                
                request.success(function (d) {
                    if (d.data) {
                        toastr.success("Your data has been updated successfully", "Awesome !");
                    }
                    else {
                        toastr.error('You probably sent blank data which resulted in the server rejecting your request.', 'Mercy !');
                    }
                });
                request.error(function (err) {
                    toastr.error('We messed up! Be good and let us know.', 'Oops! :-(')
                    console.log(err)
                });
            }
        };
        
        self.GetFake = function () {
            var obj = {};
            obj.details = true;
            var temp = $("#fakr_url").val().split('/');
            obj.id = temp[temp.length - 1];
            
            var request = $http.get('/api/v1/fakes/'+obj.id+'?details=' + obj.details)
            request.success(function (d) {
                if (d) {
                    //reset workspace to base view
                    $("#workspace>#link_output").remove();
                    $("#workspace .row").removeClass("hide").addClass("show");
                    
                    self.FakeName = d.data.name;
                    self.Reps = d.data.reps;
                    var data = d.data.type_details;
                    self.JsonKeyValues = [];
                    $.each(data, function (key, value) {                 
                        var length = self.DataTypes.length;
                        for (var i = 0; i < length; i++) {
                            if (self.DataTypes[i].Symbol === value) {
                                self.JsonKeyValues.push({
                                    Key : key,
                                    DataType : self.DataTypes[i]
                                });
                                break;
                            }
                        }
                    });
                    self.GeneratePreview();
                }
            });
            request.error(function (err) {
                toastr.error('We couldn&apos;t find data related to that URL', 'Oops! :-(')
                console.log(err)
            });
        };
        
        $http.get('/svc/data-types').success(function (d) {
            self.DataTypes = d.data;
        })

    }]);
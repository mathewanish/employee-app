﻿var SERVICE_BASEURL = "http://techchef.dminc.com/";
//var SERVICE_BASEURL = "http://techchef.dminc.com/";
//var Url = "http://61.8.142.155:5555/Chef/help";
//var Url = "http://61.8.142.155:5555/Chef/Auth";

var SCORE_TEMPLATE = '<div class="ui-grid-a ui-responsive"><div class="ui-block-a {3}"><div class="ui-body ui-body-d Positioner">{0}:</div></div><div class="ui-block-b {4}"><div class="ui-body ui-body-d"><div data-role="fieldcontain" data-type="horizontal" width="100%"><fieldset data-role="controlgroup" data-type="horizontal"><input name="{1}" id="{1}0" value="{2}:0" type="radio" /><label for="{1}0">0</label><input name="{1}" id="{1}1" value="{2}:1" type="radio" /><label for="{1}1">1</label><input name="{1}" id="{1}2" value="{2}:2" type="radio" /><label for="{1}2">2</label><input name="{1}" id="{1}3" value="{2}:3" type="radio" /><label for="{1}3">3</label><input name="{1}" id="{1}4" value="{2}:4" type="radio" /><label for="{1}4">4</label><input name="{1}" id="{1}5" value="{2}:5" type="radio" /><label for="{1}5">5</label></fieldset></div></div></div></div>';
var TOTAL_TEMPLATE = '<div class="ui-grid-a ui-responsive"><div class="ui-block-a ScoreLeft"><div class="ui-body ui-body-d Total">Total:</div></div><div class="ui-block-b"><div class="ui-body ui-body-d ScoreRight"><div class="scoreControlContainer"><table class="scoreControlTable" cellpadding="0" cellspacing="0" width="100%"><tr id="sr_{1}">{0}</tr></table></div></div></div></div>';
var TOTAL_HTML_CELL_COLORED = '<td class="cellColored" style="width:{0}%; text-align:center">{1}</td>';

var TOTAL_HTML_CELL_NONCOLORED = '<td class="cellNonColored" style="width:{0}%;">&nbsp;</td>';
var SCORE_UPDATE = '{"Category_Id":{0},"Rating":{1},"SubCategory_Id":{2},"Team_Id":{3},"User_Id":"{4}"}';
var SCORES_UPDATE = '[{0}]';


var SCORE_SUBMIT_BUTTON = '<div id="btnSubmitScore" style="display:none !important; text-align: center; width: 100%;"><a href="#" data-role="button" data-inline="true" onclick="return confirmSubmit({0});">Submit Score</a><div class="submitMessage">Once you submit, you will not able to edit the scores again.</div></div>';
var SCORE_SUBMIT_BUTTON_HIDE = '<div id="btnSubmitScore" style="display:none !important; text-align: center; width: 100%;height:20ox;">&nbsp;<div class="submitMessage">{0}</div></div>';

var UserID = "";
var UserDisplayName = "";
var expiryDateTime;

var USER_AUTH_JSON = '{"Password":"{0}", "UserName":"{1}", "UserType":"{2}", "FullName": "{3}"}';
var messageValue = '';

var master_categories = null;
var master_teams = null;
var master_subCategories = null;
var master_scores = null;

var selectedTeamID = 0;
var selectedCategoryID = 1;
var subCategoryCount = 0;

var SC_SCORE_ID_FORMAT = 'SC_{0}{1}{2}';
var SC_SCORE_VALUE_PREFIX_FORMAT = '{0}:{1}:{2}';

var WELCOME_USER_FORMAT = "<span>{0}</span>";
var TITLE_FORMAT = "{0} - {1}";

var EMAIL_DOMAIN = "dminc.com";
var SCORING_OPEN = true;

var ISCLIENTAPP = true;

$("#login").on("pagebeforecreate", function (event, ui) {
    //SetContentPrimaryMinHeight();
});

$("#login").on("pagecreate", function (event, ui) {
});


$('#login').on('pagebeforeshow', function (event, ui) {
    UserID = '';
    UserDisplayName = '';
});

$('#login').on('pageshow', function (event, ui) {
});


$("#scoreTab").on("pagebeforecreate", function (event, ui) {
});

$("#scoreTab").on("pagecreate", function (event, ui) {
});


$('#scoreTab').on('pagebeforeshow', function (event, ui) {

    ShowLoading();

    try {
        SetTeam(true, 0);
    }
    catch (err) {
    }

    HideLoading();
});


$(document).delegate('[data-role=page]', 'pageinit', function () {
    //$.mobile.touchOverflowEnabled = false;
    //$('[data-position=fixed]').fixedtoolbar({ tapToggle: false });
    //$.mobile.orientationChangeEnabled = false
});

function AuthenticationServiceFailed(xhr) {
    HideLoading();
    NotifyUser("Service Error: Could not access the service!");
    return;
}

// Handle the back button
//
function onBackKeyDown() {
    if (ISCLIENTAPP) {

        try {
            if ($.mobile.activePage.attr('id') != 'login') {
                navigator.notification.confirm('Are you sure you want to Log Out?',
            function (button) { if (button == 1) $.mobile.changePage("index.html", { transition: "slidedown", changeHash: true }); },
            'TECH CHEF', 'Yes,Cancel');
            }
        }
        catch (Err) {

        }
    }
    else {
        $.mobile.changePage("index.html", { transition: "slidedown", changeHash: true });
    }
}

function SubmitScore(isTab, scoreUpdateString) {
    ShowLoading();

    try {
        if (checkConnection()) {   
            if (scoreUpdateString != '') {
                var Url = SERVICE_BASEURL + "Chef/UpdateRating";

                $.ajax({
                    type: "POST", //GET or POST or PUT or DELETE verb
                    url: Url, // Location of the service
                    data: JSON.stringify(eval(scoreUpdateString)),
                    contentType: "application/json",
                    dataType: 'json',
                    async: false,
                    crossdomain: true,
                    processdata: true,

                    success: function (msg) {//On Successfull service call

                        messageValue = msg;

                        if (msg.serviceStatus.Success != undefined &&
                                msg.serviceStatus.Success != false) {
                            expiryDateTime = parseJsonDate(msg.serviceStatus.Expiry);
                            UserID = msg.serviceStatus.UserToken;
                            SCORING_OPEN = msg.serviceStatus.IsOpen;

                            if (SCORING_OPEN)
                                NotifyUser("Team score has been updated successfully.");
                            else
                                NotifyUser("Scoring for the competition is closed.");

                            SetEntities(msg);
                            SetTeam(isTab, selectedTeamID);
                        }
                        else
                            UserID = '';

                    },
                    error: AuthenticationServiceFailed// When Service call fails
                });
            }
        }
    }
    catch (err) {
        
    }

    HideLoading();
}


//May not be needed
function SetContentPrimaryMinHeight() {
    $('.content-primary').css({ 'min-height': (GetScreenHeight() - 39) + 'px' });
}


function GetScoreUpdateString() {

    var subCategories = GetSubCategories(selectedCategoryID);
    var scoreUpdateString = '';
    var ratingNotSet = false;

    $.each(master_teams, function (index, team) {

        var scoreID = String.format(SC_SCORE_ID_FORMAT, team.Team_Id, 4, 5);
        var subCatValue = $(String.format('input:radio[name={0}]:checked', scoreID)).val();

        if (subCatValue != undefined && subCatValue != '') {
            var subCatValueArray = subCatValue.split(':');

            if (subCatValueArray.length == 4) {
                if (scoreUpdateString != '')
                    scoreUpdateString += ',';

                scoreUpdateString += String.format(SCORE_UPDATE, subCatValueArray[1], subCatValueArray[3], subCatValueArray[2], subCatValueArray[0], UserID);
            }
        }
        else {
            ratingNotSet = true;
        }

    });

    if (!ratingNotSet) {

        if (scoreUpdateString != '')
            scoreUpdateString = String.format(SCORES_UPDATE, scoreUpdateString);
    }
    else {
        scoreUpdateString = '';
        NotifyUser("Please set a score for all Teams");
    }

    return scoreUpdateString;
}

function ShowLoading() {
    $.mobile.loading("show");
}

function HideLoading() {
    try {
        setTimeout(function () { $.mobile.loading("hide"); }, 1000);
    }
    catch (err) {
        $.mobile.loading("hide");
    }
}

function AuthenticateUser(userType, isTab) {

    if(isTab)
        $("#btlTabLoginSubmit").focus();
    else
        $("#btlSPLoginSubmit").focus();

    try {

        var userAuthString = '';
        if (userType == 'judge') {
            var userName = '';
            var password = '';

            if (isTab) {
                userName = $('#txtTabUsername').val();
                password = $('#txtTabPassword').val();
            }
            else {
                userName = $('#txtSPUsername').val();
                password = $('#txtSPPassword').val();
            }

            //Check if the user name and pasword are entered by the user
            if (userName != null && userName != '' && password != null && password != '') {
            }
            else {
                NotifyUser('Please enter a valid Username and Password.');
                HideLoading();
                return false;
            }

            userAuthString = String.format(USER_AUTH_JSON, password, userName, "Judge", "");
        }
        else {

            var name = '';
            var email = '';

            if (isTab) {
                name = $('#txtTabName').val();
                email = $('#txtTabEmail').val();
            }
            else {
                name = $('#txtSPName').val();
                email = $('#txtSPEmail').val();
            }

            name = $.trim(name);
            email = $.trim(email);

            //Check if the user name and pasword are entered by the user
            if (name != null && name != '' && email != null && email != '') {
                if (!validateEmail(email)) {
                    //HideLoading();
                    NotifyUser(String.format('Please enter a valid email of "{0}" domain.', EMAIL_DOMAIN));
                    return false;
                }
                
            }
            else {
                //HideLoading();
                NotifyUser('Please enter a valid name and email.');
                return false;
            }

            userAuthString = String.format(USER_AUTH_JSON, email, email, "User", name);
        }

        ShowLoading();

        var Url = SERVICE_BASEURL + "Chef/Auth";


        if (checkConnection()) {
            $.ajax({
                type: "POST", //GET or POST or PUT or DELETE verb
                url: Url, // Location of the service
                data: userAuthString,
                contentType: "application/json",
                dataType: 'json',
                async: false,
                crossdomain: true,
                processdata: true,

                success: function (msg) {//On Successfull service call
                    messageValue = msg;

                    if (msg.serviceStatus.Success != undefined &&
                        msg.serviceStatus.Success != false) {
                        expiryDateTime = parseJsonDate(msg.serviceStatus.Expiry);
                        UserID = msg.serviceStatus.UserToken;
                        UserDisplayName = msg.DisplayName;
                        SCORING_OPEN = msg.serviceStatus.IsOpen;
                        SetEntities(msg);
                    }
                    else
                        UserID = '';

                },
                error: AuthenticationServiceFailed// When Service call fails
            });
        }
        else {
            HideLoading();
            return false;
        }

        if (UserID != '') {
            //HideLoading();
            setTimeout(function () {
                $.mobile.changePage("#scoreTab", { transition: "slide", changeHash: true });
                HideLoading();
            }, 1000);

            return false;
        }
        else {

            HideLoading();

            if (userType == 'judge')
                NotifyUser("Invalid Username or password.");
            else
                NotifyUser("An error occured while logging into the application.");

            return false;
        }
    }
    catch (err) {
        HideLoading();
        return false;
    }

    return false;
}


function parseJsonDate(jsonDateString) {
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
}



function SetEntities(entities) {
    master_categories = entities.Categories;
    master_subCategories = entities.SubCategories;
    master_teams = entities.Teams;
    master_scores = entities.Scores;
}

function NotifyUser(message) {
    showAlert(message, 'TECH CHEF', 'OK');
}


function SetTeam(isTab, selectTeamID) {
    RenderSubCategories(isTab);
    return false;
}


function RenderSubCategories(isTab) {


    var scoreOptions = '';
    var scoreDiv = '';
    var scoreLabelClass = '';
    var scoreControlClass = '';
    var welcomeText = String.format(WELCOME_USER_FORMAT, UserDisplayName);
    var title = 'Style';

    if (isTab) {
        //SetContentPrimaryMinHeight();
        scoreDiv = '#divOutput';
        scoreLabelClass = 'ScoreLeft';
        scoreControlClass = 'ScoreRight';
        $("#tabWelcome").html(welcomeText);
        $("#tabTitle").html(title);
    }


    $.each(master_teams, function (index, team) {

        var scoreID = String.format(SC_SCORE_ID_FORMAT, team.Team_Id, 4, 5);
        var scoreValuePrefix = String.format(SC_SCORE_VALUE_PREFIX_FORMAT, team.Team_Id, 4, 5);

        scoreOptions += String.format(SCORE_TEMPLATE, team.Team_Name, scoreID, scoreValuePrefix, scoreLabelClass, scoreControlClass);
    });

    //scoreOptions += GetScoreHtml(0);
    scoreOptions += String.format(SCORE_SUBMIT_BUTTON, booleanToString(isTab));

    $(scoreDiv).empty();
    $(scoreOptions).appendTo(scoreDiv).trigger("create");

    SetScore();
    //SetTotal(null);
}

function GetTeamTitle(teamID) {
    var teamTitle = '';

    $.each(master_teams, function (index, team) {

        if (team.Team_Id == teamID)
            teamTitle = team.Team_Name;
    });

    return teamTitle;
}

function GetCategoryTitle(categoryID) {
    var categoryTitle = '';

    $.each(master_categories, function (index, category) {
        if (category.Category_Id == categoryID)
            categoryTitle = category.Category_Name;
    });

    return categoryTitle;
}


function SetScore() {

    //$('#btnSubmitScore').attr('style', 'display:inline-block !important; text-align: center; width: 100%;');
    
    var scores = GetCategoryScores();

    if (scores != null && scores.length > 0) {

        $.each(scores, function (index, score) {
            if (score.Category_Id == 4) {
                var scoreID = String.format(SC_SCORE_ID_FORMAT, score.Team_Id, score.Category_Id, score.SubCategory_Id);

                $("#" + scoreID + score.Rating).attr("checked", true).checkboxradio("refresh");
                DisableScore(scoreID);
            }
        });

        $('#btnSubmitScore').attr('style', 'display:none !important; text-align: center; width: 100%;');

    }
    else {
        if (!SCORING_OPEN)
            $('#btnSubmitScore').html('<div class="submitMessage" style="padding:5px">Scoring for DMI’s 4th annual TECH CHEF grilling competition is closed.</div>');

        $('#btnSubmitScore').attr('style', 'display:inline-block !important; text-align: center; width: 100%;');
    }
}

function DisableScore(scoreID) {

    for (var iCnt = 0; iCnt <= 5; iCnt++) {
        $("#" + scoreID + iCnt).checkboxradio("disable");
    }

}

function GetCategoryScores() {

    var scores = new Array();

    if (master_scores != null && master_scores.length > 0) {
        $.each(master_scores, function (index, score) {
                scores.push(score);
        });
    }

    return scores;
}


function GetSubCategories(categoryID) {
    var subCategories = new Array();

    $.each(master_subCategories, function (index, subCategory) {
        if (subCategory.Category_Id == categoryID)
            subCategories.push(subCategory);
    });

    subCategoryCount = subCategories.length;

    return subCategories;
}





function booleanToString(isTrue) {

    if (isTrue)
        return 'true';
    else
        return 'false';
}

function ConvertSpaceToUnderScore(text) {
    text = text.replace(/\s/gi, "_");
    return text;
}

function ConvertUnderScoreToSpace(text) {
    text = text.replace(/_/gi, " ");
    return text;
}

function GetScreenWidth() {
    return $(window).width();
}

function GetScreenHeight() {
    return $(window).height();
}


String.format = function (text) {
    //check if there are two arguments in the arguments list
    if (arguments.length <= 1) {
        //if there are not 2 or more arguments there's nothing to replace
        //just return the original text
        return text;
    }

    //decrement to move to the second argument in the array
    var tokenCount = arguments.length - 2;
    for (var token = 0; token <= tokenCount; token++) {
        //iterate through the tokens and replace their placeholders from the original text in order
        text = text.replace(new RegExp("\\{" + token + "\\}", "gi"), arguments[token + 1]);
    }

    return text;
};

// alert dialog dismissed
function alertCallBack() {
    // do something
}

function confirmSubmit(isTab) {

    var scoreUpdateString = GetScoreUpdateString();

    if (scoreUpdateString != '') {
        if (ISCLIENTAPP) {

            try {
                navigator.notification.confirm('Do you want to submit the score?', function (button) { if (button == 1) SubmitScore(isTab, scoreUpdateString); },
            'TECH CHEF', 'Yes,Cancel');
            }
            catch (Err) {

            }
        }
        else {
            SubmitScore(isTab, scoreUpdateString);
        }
    }
}

function showAlert(message, alertTitle, buttonText) {
    
    if (ISCLIENTAPP) {

        try {
            navigator.notification.alert(message, alertCallBack, alertTitle, buttonText);
            //alert(message);
        }
        catch (Err) {
            alert(Err.Message + " : " + message);
        }
    }
    else {
        alert(message);
    }
}


function checkConnection() {

    var networkExist = false;

    if (ISCLIENTAPP) {
        try {
            var states = {};
            states[Connection.UNKNOWN] = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI] = 'WiFi connection';
            states[Connection.CELL_2G] = 'Cell 2G connection';
            states[Connection.CELL_3G] = 'Cell 3G connection';
            states[Connection.CELL_4G] = 'Cell 4G connection';
            states[Connection.CELL] = 'Cell generic connection';
            states[Connection.NONE] = 'No network connection';

            var networkState = navigator.connection.type;

            if (states[networkState] == states[Connection.NONE])
                showAlert('Network Connection not available!', 'Network Connection', 'OK');
            else
                networkExist = true;
        }
        catch (Err) {
            networkExist = true;
        }
    }
    else
        networkExist = true;

    return networkExist;
}


function checkValidation(email) {

    var message;

    if (noAtSign(email)) {
        message = "The email \"" + email + "\" does not contain an '@' character.";
        alert(message);
    } else if (nothingBeforeAt(email)) {
        message = "The email \"" + email;
        message += "\" must contain at least one character before the '@' character";
        alert(message);
    } else if (noValidSuffix(email)) {
        message = "Error! The address \"" + email;
        message += "\" must contain a two, three or four character suffix.";
        alert(message);
    } else {
        return true;
    }

    return (false);
}

function validateEmail(email) {
    var regEx = /^([a-zA-Z0-9_\.\-])+\@dminc.com/;
    return regEx.test(email);
}



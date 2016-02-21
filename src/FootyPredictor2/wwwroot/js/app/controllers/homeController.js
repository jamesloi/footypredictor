
angular.module('app').controller('SelectCtrl', function ($scope, $http, uiGridConstants, footballapi) {
    var teamCrest = [];
    $scope.gridOptionsFixtureList = {};
    $scope.gridOptionsFixtureList.data = 'fixturesData';
    $scope.gridOptionsFixtureList.enableColumnResizing = true;
    $scope.gridOptionsFixtureList.enableFiltering = true;
    $scope.gridOptionsFixtureList.enableGridMenu = true;
    $scope.gridOptionsFixtureList.fastWatch = true;
    $scope.gridOptionsFixtureList.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;

    $scope.gridOptionsFixtureList.columnDefs = [
        { name: 'day', field: 'date', cellFilter: 'date:"d EEE"', width: 60, type: 'date' },
        { name: 'month', field: 'date', cellFilter: 'date:"MMMM"', width: 90, type: 'date' },
        { name: 'year', field: 'date', cellFilter: 'date:"yyyy"', width: 60, type: 'date' },
        { name: 'time', field: 'date', cellFilter: 'date:"h:mm a"', width: 80, type: 'date' },
        { name: 'home', field: 'homeTeamName', width: 190, cellTemplate: "<div><img width=\"20px\" height=\"20px\" ng-src=\"{{row.entity.crestHomeURI}}\" lazy-src>&nbsp;&nbsp;{{row.entity.homeTeamName}}</div>" },
        { name: 'Away', field: 'awayTeamName', width: 190, cellTemplate: "<div><img width=\"20px\" height=\"20px\" ng-src=\"{{row.entity.crestAwayURI}}\" lazy-src>&nbsp;&nbsp;{{row.entity.awayTeamName}}</div>" },
        { name: 'score', field: 'score', width: 70 },
        { name: 'result', field: 'result', width: 90 }
    ];

    $scope.gridOptionsLeague = {};
    $scope.gridOptionsLeague.data = 'leagueData';
    $scope.gridOptionsLeague.enableColumnResizing = true;
    $scope.gridOptionsLeague.enableFiltering = true;
    $scope.gridOptionsLeague.enableGridMenu = true;
    $scope.gridOptionsLeague.fastWatch = true;
    $scope.gridOptionsLeague.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;

    $scope.gridOptionsLeague.columnDefs = [
        { name: 'pos', field: 'position', width: 60 },
        { name: 'team', field: 'crestURI', width: 200, cellTemplate: "<div><img width=\"20px\" height=\"20px\" ng-src=\"{{row.entity.crestURI}}\" alt=\"\" lazy-src>&nbsp;&nbsp;{{row.entity.teamName}}</div>" },
        { name: 'played', field: 'played', width: 80 },
        { name: 'points', field: 'points', width: 80, cellClass: 'points' },
        { name: 'goals', field: 'goals', width: 80 },
        { name: 'against', field: 'against', width: 80 },
        { name: 'diff', field: 'difference', width: 80 },
        { name: 'wins (H)', field: 'winsH', width: 80, cellClass: 'home' },
        { name: 'draws (H)', field: 'drawsH', width: 80, cellClass: 'home' },
        { name: 'losses (H)', field: 'lossesH', width: 80, cellClass: 'home' },
        { name: 'wins (A)', field: 'winsA', width: 80, cellClass: 'away' },
        { name: 'draws (A)', field: 'drawsA', width: 80, cellClass: 'away' },
        { name: 'losses (A)', field: 'lossesA', width: 80, cellClass: 'away' }
    ];

    $scope.disabled = undefined;

    $scope.enable = function () {
        $scope.disabled = false;
    };

    $scope.disable = function () {
        $scope.disabled = true;
    };

    $scope.clear = function () {
        $scope.seasonSelected.selected = undefined;
        $scope.teamSelected.selected = undefined;
    };

    $scope.seasonSelected = {};
    $scope.season = [];
    $.ajax({
        headers: { 'X-Auth-Token': footballapi.apiKey },
        url: footballapi.apiUrl + 'soccerseasons',
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            $.each(data, function (key, val) {
                if (val.caption.indexOf("Champions") === -1)
                    $scope.season.push({ teamsUrl: val._links.teams.href, fixturesUrl: val._links.fixtures.href, leagueUrl: val._links.leagueTable.href, name: val.caption, numberOfTeams: val.numberOfTeams, numberOfGames: val.numberOfGames, lastUpdated: val.lastUpdated });
            });
            $scope.season.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        },
        error: function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        }
    });

    $scope.updateSeason = function () {
        if (typeof $scope.seasonSelected.selected !== "undefined" && $scope.seasonSelected.selected !== null) {
            $scope.teamSelected = {};
            $scope.team = [];
            teamCrest = [];
            $.ajax({
                headers: { 'X-Auth-Token': footballapi.apiKey },
                url: $scope.seasonSelected.selected.teamsUrl,
                dataType: 'json',
                type: 'GET',
                async: false,
                success: function (data) {
                    $.each(data.teams, function (key, val) {
                        $scope.team.push({ name: val.name, shortName: val.shortName, squadMarketValue: val.squadMarketValue, crestUrl: val.crestUrl });
                        teamCrest[val.name] = val.crestUrl;
                    });
                    $scope.team.sort(function (a, b) {
                        var textA = a.name.toUpperCase();
                        var textB = b.name.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                },
                error: function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                }
            });

            $scope.fixtureSelected = {};
            $scope.fixturesData = [];
            $.ajax({
                headers: { 'X-Auth-Token': footballapi.apiKey },
                url: $scope.seasonSelected.selected.fixturesUrl,
                dataType: 'json',
                type: 'GET',
                async: false,
                success: function (data) {
                    $.each(data.fixtures, function (key, val) {
                        var score = '';
                        var result = '';
                        if (val.result.goalsHomeTeam != null)
                            score = val.result.goalsHomeTeam;
                        score = score + ' : ';
                        if (val.result.goalsAwayTeam != null)
                            score = score + val.result.goalsAwayTeam;
                        if (val.result.goalsHomeTeam == null && val.result.goalsAwayTeam == null) {
                            result = "Unplayed";
                        } else {
                            if (val.result.goalsHomeTeam > val.result.goalsAwayTeam)
                                result = "Home Win";
                            if (val.result.goalsHomeTeam < val.result.goalsAwayTeam)
                                result = "Away Win";
                            if (val.result.goalsHomeTeam === val.result.goalsAwayTeam)
                                result = "Draw";
                        }
                        $scope.fixturesData.push({
                            date: val.date, matchday: val.matchday, homeTeamName: val.homeTeamName, awayTeamName: val.awayTeamName, score: score, result: result,
                            crestHomeURI: teamCrest[val.homeTeamName], crestAwayURI: teamCrest[val.awayTeamName], goalsHome: val.result.goalsHomeTeam, goalsAway: val.result.goalsAwayTeam
                        });
                    });
                    $("#divFixturesList").fadeIn();
                },
                error: function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                    $("#divFixturesList").fadeOut();
                }
            });

            $scope.leagueSelected = {};
            $scope.leagueData = [];
            $.ajax({
                headers: { 'X-Auth-Token': footballapi.apiKey },
                url: $scope.seasonSelected.selected.leagueUrl,
                dataType: 'json',
                type: 'GET',
                success: function (data) {
                    $.each(data.standing, function (key, val) {
                        var result = $.grep($scope.fixturesData, function (e) { return e.homeTeamName === val.teamName || e.awayTeamName === val.teamName; });
                        var oversCount = 0;
                        var undersCount = 0;
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].result !== "Unplayed") {
                                if (((result[i].goalsHome + result[i].goalsAway) > 2.5)) {
                                    oversCount++;
                                } else {
                                    undersCount++;
                                }
                            }
                        }
                        $scope.leagueData.push({
                            position: val.position, teamName: val.teamName, crestURI: teamCrest[val.teamName], played: val.playedGames, points: val.points, goals: val.goals, against: val.goalsAgainst, difference: val.goalDifference,
                            winsH: val.home.wins, drawsH: val.home.draws, lossesH: val.home.losses, winsA: val.away.wins, drawsA: val.away.draws, lossesA: val.away.losses,
                            oversPercent: (oversCount / val.playedGames) * 100, undersPercent: (undersCount / val.playedGames) * 100, winPercent: ((val.home.wins + val.away.wins) / val.playedGames) * 100,
                            drawPercent: ((val.home.draws + val.away.draws) / val.playedGames) * 100, lossPercent: ((val.home.losses + val.away.losses) / val.playedGames) * 100
                        });
                    });
                    $scope.$apply();
                    var winsArray = $scope.leagueData.slice(0);
                    winsArray.sort(function (a, b) {
                        var A = a.winPercent;
                        var B = b.winPercent;
                        return (A > B) ? -1 : (A < B) ? 1 : 0;
                    });
                    $scope.mostWins = winsArray[0];

                    var drawArray = $scope.leagueData.slice(0);
                    drawArray.sort(function (a, b) {
                        var A = a.drawPercent;
                        var B = b.drawPercent;
                        return (A > B) ? -1 : (A < B) ? 1 : 0;
                    });
                    $scope.mostDraw = drawArray[0];

                    var lossArray = $scope.leagueData.slice(0);
                    lossArray.sort(function (a, b) {
                        var A = a.lossPercent;
                        var B = b.lossPercent;
                        return (A > B) ? -1 : (A < B) ? 1 : 0;
                    });
                    $scope.mostLoss = lossArray[0];

                    var oversArray = $scope.leagueData.slice(0);
                    oversArray.sort(function (a, b) {
                        var A = a.oversPercent;
                        var B = b.oversPercent;
                        return (A > B) ? -1 : (A < B) ? 1 : 0;
                    });
                    $scope.mostOvers = oversArray[0];

                    var undersArray = $scope.leagueData.slice(0);
                    undersArray.sort(function (a, b) {
                        var A = a.undersPercent;
                        var B = b.undersPercent;
                        return (A > B) ? -1 : (A < B) ? 1 : 0;
                    });
                    $scope.mostUnders = undersArray[0];

                    $("#graphLeaderWin").empty();
                    $("#graphLeaderDraw").empty();
                    $("#graphLeaderLoss").empty();
                    $("#graphLeaderOver").empty();
                    $("#graphLeaderUnder").empty();
                    drawDonutChart('graphLeaderWin', $scope.leagueData[0].winPercent, 'Won', 'Other');
                    drawDonutChart('graphLeaderDraw', $scope.leagueData[0].drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphLeaderLoss', $scope.leagueData[0].lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphLeaderOver', $scope.leagueData[0].oversPercent, 'Over', 'Under');
                    drawDonutChart('graphLeaderUnder', $scope.leagueData[0].undersPercent, 'Under', 'Over');
                    $("#graphWinsWin").empty();
                    $("#graphWinsDraw").empty();
                    $("#graphWinsLoss").empty();
                    $("#graphWinsOver").empty();
                    $("#graphWinsUnder").empty();
                    drawDonutChart('graphWinsWin', $scope.mostWins.winPercent, 'Won', 'Other');
                    drawDonutChart('graphWinsDraw', $scope.mostWins.drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphWinsLoss', $scope.mostWins.lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphWinsOver', $scope.mostWins.oversPercent, 'Over', 'Under');
                    drawDonutChart('graphWinsUnder', $scope.mostWins.undersPercent, 'Under', 'Over');
                    $("#graphDrawWin").empty();
                    $("#graphDrawDraw").empty();
                    $("#graphDrawLoss").empty();
                    $("#graphDrawOver").empty();
                    $("#graphDrawUnder").empty();
                    drawDonutChart('graphDrawWin', $scope.mostDraw.winPercent, 'Won', 'Other');
                    drawDonutChart('graphDrawDraw', $scope.mostDraw.drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphDrawLoss', $scope.mostDraw.lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphDrawOver', $scope.mostDraw.oversPercent, 'Over', 'Under');
                    drawDonutChart('graphDrawUnder', $scope.mostDraw.undersPercent, 'Under', 'Over');
                    $("#graphLossWin").empty();
                    $("#graphLossDraw").empty();
                    $("#graphLossLoss").empty();
                    $("#graphLossOver").empty();
                    $("#graphLossUnder").empty();
                    drawDonutChart('graphLossWin', $scope.mostLoss.winPercent, 'Won', 'Other');
                    drawDonutChart('graphLossDraw', $scope.mostLoss.drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphLossLoss', $scope.mostLoss.lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphLossOver', $scope.mostLoss.oversPercent, 'Over', 'Under');
                    drawDonutChart('graphLossUnder', $scope.mostLoss.undersPercent, 'Under', 'Over');
                    $("#graphOversUnder").empty();
                    $("#graphOversOver").empty();
                    $("#graphOversLoss").empty();
                    $("#graphOversDraw").empty();
                    $("#graphOversWin").empty();
                    drawDonutChart('graphOversWin', $scope.mostOvers.winPercent, 'Won', 'Other');
                    drawDonutChart('graphOversDraw', $scope.mostOvers.drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphOversLoss', $scope.mostOvers.lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphOversOver', $scope.mostOvers.oversPercent, 'Over', 'Under');
                    drawDonutChart('graphOversUnder', $scope.mostOvers.undersPercent, 'Under', 'Over');
                    $("#graphUndersUnder").empty();
                    $("#graphUndersOver").empty();
                    $("#graphUndersLoss").empty();
                    $("#graphUndersDraw").empty();
                    $("#graphUndersWin").empty();
                    drawDonutChart('graphUndersWin', $scope.mostUnders.winPercent, 'Won', 'Other');
                    drawDonutChart('graphUndersDraw', $scope.mostUnders.drawPercent, 'Draw', 'Other');
                    drawDonutChart('graphUndersLoss', $scope.mostUnders.lossPercent, 'Lost', 'Other');
                    drawDonutChart('graphUndersOver', $scope.mostUnders.oversPercent, 'Over', 'Under');
                    drawDonutChart('graphUndersUnder', $scope.mostUnders.undersPercent, 'Under', 'Over');

                    $('[name="statsDiv"]').fadeIn();
                    $("#divLeague").fadeIn();
                },
                error: function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                    $("#divLeague").fadeOut();
                }
            });
            $("#divTeamDetails").hide();
            $("#divSelectTeams").fadeIn();
            $('[name="divStats"]').fadeIn();
            $("#divLeagueDetails").fadeIn();
            $("img").error(function () {
                $(this).hide();
            });
        } else {
            $("#divSelectTeams").fadeOut();
            $("#divFixturesList").fadeOut();
            $('[name="divStats"]').fadeOut();
            $("#divLeagueDetails").fadeOut();
        }
    }

    $scope.updateTeam = function () {
        if (typeof $scope.teamSelected.selected !== "undefined" && $scope.teamSelected.selected !== null) {
            $("#divLeagueDetails").hide();
            $("#divTeamDetails").fadeIn();
            $('[name="divTeamStats"]').fadeIn();
            $("#graphTeamWin").empty();
            $("#graphTeamDraw").empty();
            $("#graphTeamLoss").empty();
            $("#graphTeamOver").empty();
            $("#graphTeamUnder").empty();
            var teamStats = jQuery.grep($scope.leagueData, function (n, i) {
                return n.teamName === $scope.teamSelected.selected.name;
            });
            drawDonutChart('graphTeamWin', teamStats[0].winPercent, 'Won', 'Other');
            drawDonutChart('graphTeamDraw', teamStats[0].drawPercent, 'Draw', 'Other');
            drawDonutChart('graphTeamLoss', teamStats[0].lossPercent, 'Lost', 'Other');
            drawDonutChart('graphTeamOver', teamStats[0].oversPercent, 'Over', 'Under');
            drawDonutChart('graphTeamUnder', teamStats[0].undersPercent, 'Under', 'Over');
            $('[name="statsTeamDiv"]').fadeIn();
        }
    }
});

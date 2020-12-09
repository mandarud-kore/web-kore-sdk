(function ($) {

    $(document).ready(function () {

        function koreGenerateUUID() {
            console.info("generating UUID");
            var d = new Date().getTime();
            if (window.performance && typeof window.performance.now === "function") {
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }

        function getQueryStringValue(key) {
            return window.location.search.replace(new RegExp("^(?:.*[&\\?]" + key.replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1");
        }

        function assertion(options, callback) {
            var jsonData = {
                "tenantId": options.botInfo.customData.tenantId,
                "uniqueUserId": options.botInfo.customData.uniqueUserId,
            };
            $.ajax({
                url: options.JWTUrl,
                type: 'post',
                data: jsonData,
                dataType: 'json',
                success: function (data) {
                    options.botInfo.chatBot = data.botInfo.name;
                    chatConfig.botOptions.botInfo.name = data.botInfo.name;
                    options.botInfo.taskBotId = data.botInfo._id;
                    chatConfig.botOptions.botInfo._id = data.botInfo._id;
                    options.koreAPIUrl = data.koreAPIUrl;
                    options.assertion = data.jwt;
                    options.uniqueUserId = data.uniqueUserId;
                    options.handleError = koreBot.showError;
                    options.chatHistory = koreBot.chatHistory;
                    // options.botDetails = koreBot.botDetails(data);
                    callback(null, options);
                    setTimeout(function () {
                        // getBrandingInformation(options);
                        CheckRefreshToken(options);
                        
                    }, 2000);
                },
                error: function (err) {
                    koreBot.showError(err.responseText);
                }
            });
        }

        function CheckRefreshToken(options){
            var jsonData = {
                "userId": window.jwtDetails.userInfo.userId,
                "uniqueUserId": options.uniqueUserId
            };
            $.ajax({
                url: "https://staging-bankassist.korebots.com/finastra-wrapper/uniqueUser",
                type: 'post',
                data: jsonData,
                dataType: 'json',
                success: function (data) {
                    if (koreBot && koreBot.initToken) {
                        koreBot.initToken(options);
                    }
                }
            });
        }

        function getBrandingInformation(options) {
            $.ajax({
                url: 'https://staging-bots.korebots.com/workbench/api/workbench/sdkData?objectId=hamburgermenu&objectId=brandingwidgetdesktop',
                headers: {
                    'tenantId': chatConfig.botOptions.accountId,
                    'Authorization': "bearer " + options.authorization.accessToken,
                    'Accept-Language': 'en_US',
                    'Accepts-version': '1',
                    'state': 'published'
                },
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    options.botDetails = koreBot.botDetails(data[1].brandingwidgetdesktop);
                    chatConfig.botOptions.hamburgermenuData = data[0].hamburgermenu;
                    if (koreBot && koreBot.initToken) {
                        koreBot.initToken(options);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
        
        var korecookie = localStorage.getItem("korecom");
        var uuid = getQueryStringValue('uid');
        if (uuid) {
            console.log(uuid);
        } else {
            uuid = koreGenerateUUID();
        }

        localStorage.setItem("korecom", uuid);
        var chatConfig = window.KoreSDK.chatConfig;
        chatConfig.botOptions.assertionFn = assertion;
        chatConfig.botOptions.jwtgrantSuccessCB = getBrandingInformation;

        var koreBot = koreBotChat();
        koreBot.show(chatConfig);
        $('.openChatWindow').click(function () {
            koreBot.show(chatConfig);
        });
    });

})(jQuery || (window.KoreSDK && window.KoreSDK.dependencies && window.KoreSDK.dependencies.jQuery));
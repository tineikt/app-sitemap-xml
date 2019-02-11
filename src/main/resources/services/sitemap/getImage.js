var portal = require('/lib/xp/portal');
var httpClientLib = require('/lib/xp/http-client');
var siteConfig = null;

exports.getImageAndTitleForRecipeId = function(recipeId){
    if(siteConfig == null){
        siteConfig = portal.getSiteConfig();
    }
    return recipeRequest(recipeId);
};

function recipeRequest(recipeId) {
    var odbUrl = siteConfig.siteMapODB.odbUrl + '/recipes/' + recipeId;
    var odbToken = siteConfig.siteMapODB.odbToken;

    if(odbToken){
        var result = runRequest(createRequest(odbUrl, odbToken));

        if(result && result.image && result.image.url){
            var recipeImageUrl = result.image.url;

            if(result.image.sourceWidth >= result.image.sourceHeight){
                recipeImageUrl = recipeImageUrl.replace(/%width%/, result.image.sourceWidth >= 1000 ? 1000 : result.image.sourceWidth);
                recipeImageUrl = recipeImageUrl.replace(/h_%height%/, '');
            }else{
                recipeImageUrl = recipeImageUrl.replace(/%height%/, result.image.sourceHeight >= 1000 ? 1000 : result.image.sourceHeight);
                recipeImageUrl = recipeImageUrl.replace(/w_%width%/, '');
            }

            return { imageUrl: recipeImageUrl, imageTitle: result.image.title };
        }
    }
    return null;
}

function createRequest(url, odbToken) {
    var httpRequest = {
        url: url,
        method: 'GET',
        contentType: 'application/json',
        connectionTimeout: 3600 * 10,
        readTimeout: 3600 * 10,
        headers: {
            Authorization: 'Bearer ' + odbToken,
            'Content-Type': 'application/json'
        }
    };
    return httpRequest;
}

function runRequest(requestObject) {
    var response = httpClientLib.request(requestObject);
    if (response.status >= 400 || !response.body) {
        log.error(JSON.stringify(response, null, 2));
        return {}; // Todo: Use exceptions instead of returning empty stuff. This is what exceptions are made for!
    }
    return JSON.parse(response.body);
}
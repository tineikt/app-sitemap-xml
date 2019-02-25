var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    xslt: require('/lib/xp/xslt'),
    recipeImage: require('./getImage')
};

var globals = {
	view: resolve('sitemap.xsl'),
	updatePeriod: "monthly",
	priority: "0.5",
	alwaysAdd: "portal:site"
};

function handleGet(req) {

    var site = libs.portal.getSite();
    var siteConfig = libs.portal.getSiteConfig();

    var arrContentTypes = [];
	 var changefreq = {}, priority = {};
	 var siteAdded = false;
    var siteMapSettings = siteConfig.siteMap ? libs.util.data.forceArray(siteConfig.siteMap) : null;
    if (siteMapSettings) {
        for (var j = 0; j < siteMapSettings.length; j++) {
            var cty = siteMapSettings[j].contentType || "";
				if (cty === globals.alwaysAdd) { siteAdded = true; } // To be able to automatically add site content type if not already added by user.
				arrContentTypes.push(cty);
            changefreq[cty] = siteMapSettings[j].updatePeriod || globals.updatePeriod;
            priority[cty] = siteMapSettings[j].priority || globals.priority;
        }
    }

	 // Default settings for site (frontpage) set to be changed and prioritized often.
	 if (!siteAdded) {
		 cty = globals.alwaysAdd;
		 arrContentTypes.push(cty);
		 changefreq[cty] = "Hourly";
		 priority[cty] = "1.0";
	 }

	 // Only allow content from current Site to populate the sitemap.
	 var folderPath = site._path;
	 var contentRoot = '/content' + folderPath + '';
	 var query = '_path LIKE "' + contentRoot + '/*" OR _path = "' + contentRoot + '"';

	 // Query that respects the settings from SEO Metafield plugin, if present, using 6.10 query filters - @nerdegutt.
    var result = libs.content.query({
        query: query,
        sort : 'modifiedTime DESC',
        contentTypes: arrContentTypes,
        count: 10000,
		  filters: {
		    boolean: {
		      mustNot: {
		        hasValue: {
		          field: "x.com-enonic-app-metafields.meta-data.blockRobots",
		          values: "true"
				  }
		      }
			 }
    }
    });

	 // Go through the results and add the corresponding settings for each match.
	 var items = [];
    for(var i = 0 ; i < result.hits.length; i++ ) {
		  var item = {};
        if (result.hits[i].type) {
            var hit = result.hits[i];
            var recipeId = hit.data.recipeId;
            var recipeImageData = siteConfig && siteConfig.siteMapODB && siteConfig.siteMapODB.getDataFromODB && recipeId ? libs.recipeImage.getImageAndTitleForRecipeId(recipeId) : null;
            item.imageUrl = recipeImageData && recipeImageData.imageUrl ? recipeImageData.imageUrl : null;
            if(!recipeId && hit.data && hit.data.media && hit.data.media.mediaImage && hit.data.media.mediaImage.imgSrc) {
                item.imageUrl = libs.portal.imageUrl({ id:hit.data.media.mediaImage.imgSrc, type: 'absolute', scale: 'max(1000)' });
            }
            item.imageTitle = recipeImageData && recipeImageData.imageTitle ? recipeImageData.imageTitle : null;
            item.changeFreq = changefreq[hit.type];
            item.priority = priority[hit.type];
				item.url = libs.portal.pageUrl({
					id: hit._id,
					type: 'absolute'
				});
				item.modifiedTime = hit.modifiedTime;
				items.push(item);
        } else {
            result.hits = null;
        }
    }

    var model = {
        result: items
    };

    return {
        contentType: 'text/xml',
        body: libs.xslt.render(globals.view, model)
    };
}
exports.get = handleGet;

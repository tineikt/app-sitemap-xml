# Sitemap.xml -

This app is a fork of app-sitemap-xml from Enonic. It's modified to add support for images in sitemap (and later on maybe more stuff from ODB).

For more information, check out Enonics repo: https://github.com/enonic/app-sitemap-xml

Fork is based on v1.1.1.

## Good to know
Enabling ODB integration makes the generation of sitemap.xml take A LOT more time! 
- Maybe look into batch fetching image URLs from ODB with a list of recipeIDs?

Cache is king!

## Changelog

### Version 1.1.2 - Tine ODB integration
This version ads support for images in sitemap.xml. Fetches image URLs from ODB based in recipeId. CheckBox for enabling/disabling ODB integration in SiteConfig. 

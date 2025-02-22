lookup.escapeRegExp = function(string) 
{
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
lookup.does_rule_exists = function(stuff)
{
    var result = lookup.rules.some(existing_rule => existing_rule.original === stuff);
    return result;
};
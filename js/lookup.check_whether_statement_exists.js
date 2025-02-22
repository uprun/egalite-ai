lookup.check_whether_statement_exists = function(stuff)
{
    var result = lookup.statements.some(existing_statement => existing_statement.original === stuff);
    return result;
};
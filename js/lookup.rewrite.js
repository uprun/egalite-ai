lookup.index_in_statements = 0;
lookup.index_in_rules = 0;
lookup.rewrite = function()
{
    var start = new Date();
    var operations_passed = 0;
    console.log("rewrite", lookup.statements.length);
    for(;lookup.index_in_statements < lookup.statements.length; lookup.index_in_statements++)
    {
        const fact = lookup.statements[lookup.index_in_statements];
        if (fact.original.includes(" => ")) 
        {
            console.log("Weird, fact is rule", fact);
            continue;
        }
        for(; lookup.index_in_rules < lookup.rules.length; lookup.index_in_rules++)
        {
            const rule = lookup.rules[lookup.index_in_rules];
            if (rule.type != "rule") continue;
            operations_passed++;
            var all_conditions_are_met = true;
            
            if (operations_passed > 1000)
            {
                var current_date = new Date();
                if (current_date - start > 30)
                {
                    setTimeout(lookup.rewrite, 30);
                    return;
                }
                operations_passed -= 1000;
            }

            for(const single_condition of rule.data.conditions)
            {
                if (single_condition.already_was_matched) {
                    continue;
                }

                if (single_condition.should_match_regexp.test(fact.original) !== true)
                {
                    continue;
                }
                
                var values = fact.original.split(single_condition.inverted_slot_regexp);
                var non_empty_values = values.filter(v => v !== "");
                if ( non_empty_values.length != single_condition.slots.length)
                {
                    console.log("values do not match to slots which is weird", fact.original, single_condition.original)
                }
                
                //console.log(values, variables);
                var combined_rule = rule.original;
                for(var k = 0; k < single_condition.slots.length; k++)
                {
                    const just_slot = single_condition.slots[k];
                    const just_value = non_empty_values[k];

                    combined_rule = combined_rule.replaceAll(just_slot, just_value);
                }

                
                var chain_of_thought = [rule.original, fact.original, combined_rule];
                lookup.add_statement(combined_rule, 'partially-applied-rule', chain_of_thought);
                break;

            }
        }
        lookup.index_in_rules = 0;
    }
    lookup.index_in_statements = 0;
    setTimeout(lookup.rewrite, 30);
};
setTimeout(lookup.rewrite, 30);
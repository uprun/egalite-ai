lookup.add_statement = function(stuff, where_it_comes_from, chain_of_thought)
    {
        if (stuff.indexOf(" => ") >= 0)
        {
            if (lookup.does_rule_exists(stuff))
            {
                return;
            }
            const named_slot_regexp = /\*[A-Z]\*/
            const [conditionsPart , conclusion] = stuff.split(" => ");
            const conditions = conditionsPart.split(" | ");
            const conditions_objects = conditions.map(single_condition => {
                
                var splitted_by_slots = single_condition.split(named_slot_regexp);
                var non_empty_static_parts = splitted_by_slots
                    .filter(e => e !== "");
                var mapped = 
                    splitted_by_slots
                    .map((p, index) => {
                        if(index == 0)
                        {
                            if ( p !== "")
                            {
                                return "^" + lookup.escapeRegExp(p)
                            }
                        }
                        if (index === splitted_by_slots.length - 1)
                        {
                            if (p !== "")
                            {
                                return lookup.escapeRegExp(p) + "$";
                            }
                        }
                        if (p !== "")
                        {
                            return lookup.escapeRegExp(p);
                        }
                        return "";
                    });

                var filtered_regexps = mapped.filter(p => p !== "");

                var mask = filtered_regexps.join("|");
                var inverted_slot_regexp = new RegExp(mask);

                var partially_prepared_regexp_components = splitted_by_slots.map(e => e === "" ? ".+" : lookup.escapeRegExp(e) );
                var partially_prepared_regexp = partially_prepared_regexp_components.join("");
                var should_match = `^${partially_prepared_regexp}\$`;
                var should_match_regexp = new RegExp(should_match);
                var slots = single_condition.split(inverted_slot_regexp);
                var slots_non_empty = slots.filter(e => e !== "");
                const result = {
                    already_was_matched: splitted_by_slots.length == 1,
                    static_parts: non_empty_static_parts,
                    inverted_slot_regexp: inverted_slot_regexp,
                    slots: slots_non_empty,
                    should_match_regexp: should_match_regexp,
                    original: single_condition
                };
                return result;
            });
            const to_add = {
                type: "rule",
                original: stuff,
                where_it_comes_from: where_it_comes_from,
                data: {
                    conditions: conditions_objects,
                    conclusion: conclusion
                },
                chain_of_thought: chain_of_thought || [stuff]
            };
            if ( to_add.data.conditions.every(single_condition => single_condition.already_was_matched))
            {
                lookup.add_statement(to_add.data.conclusion, "fully-applied-rule", to_add.chain_of_thought);
            }
            else
            {
                lookup.rules.push(to_add);
                console.log(to_add);
            }
            
        }
        else
        {
            if (lookup.check_whether_statement_exists(stuff))
            {
                return;
            }
            if (lookup.statements.length > 1000)
            {
                console.log("Statements limit");
                return;
            }
            const to_add = {
                type: "fact",
                original: stuff,
                where_it_comes_from: where_it_comes_from,
                chain_of_thought: chain_of_thought || [stuff]
            };
            lookup.statements.push(to_add);
            console.log(to_add);
        }
    };
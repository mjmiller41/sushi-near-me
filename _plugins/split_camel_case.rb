module Jekyll
  module SplitCamelCaseFilter
    def split_camel_case(input)
      # Insert a space before each capital letter and split
      input.to_s.gsub(/([A-Z])/, ' \1').strip.split
    end
  end
end

Liquid::Template.register_filter(Jekyll::SplitCamelCaseFilter)
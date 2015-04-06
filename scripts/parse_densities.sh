rvm use jruby-1.7.5

jruby -S gem install tabula-extractor 

# Manually pasted in first and last pages as they have different areas
#
tabula --pages 23-44 ../data/db-worldua.pdf -a 55,75,550,700 -o output.csv
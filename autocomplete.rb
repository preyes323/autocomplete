require 'bundler/setup'
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/json'
require 'json'
require 'pry'

COUNTRIES_PATH = File.expand_path('../data/countries.json', __FILE__)

get '/' do
  erb :index
end

get '/countries' do
  query = params[:matching].downcase
  search_results = search_country(query)
  json search_results
end

def search_country(query)
  return [] if query.empty?
  countries.select { |country| name_starts_with(country, query) }.first(20)
end

def countries
  file = File.read(COUNTRIES_PATH)
  countries = JSON.parse(file)
end

def name_starts_with(country, characters)
  country["name"].downcase.start_with?(characters)
end

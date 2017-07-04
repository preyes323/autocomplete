ENV['RACK_ENV'] = 'test'
require 'bundler/setup'
require 'minitest/autorun'
require 'rack/test'
# require 'minitest/reporters'
require_relative '../autocomplete.rb'

# Minitest::Reporters.use!

class TypeaheadTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end


  def test_it_sends_one_country_with_exact_match
    get '/countries?matching=Pakistan'
    assert last_response.ok?
    assert last_response.body.include?('Pakistan')
  end

  def test_it_is_case_insensitive
    get '/countries?matching=pakistan'
    assert last_response.ok?
    assert last_response.body.include?('Pakistan')
  end

  def test_it_does_not_return_countries_matching_query_in_middle
    get '/countries?matching=pa'
    assert last_response.ok?
    assert !last_response.body.include?('Occupied Palestinian')
  end

  def test_it_returns_no_countries_if_no_match
    get '/countries?matching=Xz'
    assert last_response.ok?
    assert_equal '[]', last_response.body
  end

  def test_it_returns_no_countrie_if_query_empty
    get '/countries?matching='
    assert last_response.ok?
    assert_equal '[]', last_response.body
  end
end

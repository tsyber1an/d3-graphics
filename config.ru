require 'json'
require 'active_support/core_ext/string'
require 'handlebars_assets'

class QuanApp
  def call(env)
    if env['REQUEST_PATH'] =~ /\.json/
      [200, {}, [File.open('json/'+env['REQUEST_PATH']).read]]
    else
      [200, {}, [File.open('assets/html/app.html').read]]
    end
  end
end

app = Rack::Builder.app do
  use Rack::Head

  map('/') do
    quan_app = QuanApp.new
    protected_quan_app = Rack::Auth::Basic.new(quan_app) do |username, password|
      'guest' == username  && '1xbbzdhaIv41T2K' == password
    end
    protected_quan_app.realm = 'QuanApp Hight Profit'
    pretty_protected_quan_app = Rack::ShowStatus.new(Rack::ShowExceptions.new(protected_quan_app))
    run pretty_protected_quan_app
  end

  map '/assets' do
    use Rack::Deflater
    env = Sprockets::Environment.new
    env.append_path 'assets/javascripts'
    env.append_path 'assets/stylesheets'
    env.append_path 'assets/templates'
    env.append_path 'assets/images'
    env.append_path HandlebarsAssets.path

    run env
  end
end
run app

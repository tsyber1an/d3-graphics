require 'json'
require 'active_support/core_ext/string'
require 'jasmine'
require 'handlebars_assets'

config = Jasmine::Config.new

jasmine = Rack::Builder.app do
  use Rack::Head

  map('/run.html')         { run Jasmine::Redirect.new('/') }
  map('/__suite__')        { run Jasmine::FocusedSuite.new(config) }

  map('/__JASMINE_ROOT__') { run Rack::File.new(Jasmine::Core.path) }
  map(config.spec_path)    { run Rack::File.new(config.spec_dir) }
  map(config.root_path)    { run Rack::File.new(config.project_root) }

  map('/') do
    run Rack::Cascade.new([
                              Rack::URLMap.new('/' => Rack::File.new(config.src_dir)),
                              Jasmine::RunAdapter.new(config)
                          ])
  end


  map '/assets' do
    use Rack::Deflater
    env = Sprockets::Environment.new
    env.append_path 'assets'
    env.append_path HandlebarsAssets.path

    run env
  end
end

fork do
  server = Rack::Server.new(:Port => 8888, :AccessLog => [])
  server.instance_variable_set(:@app, jasmine) # workaround for Rack bug, when Rack > 1.2.1 is released Rack::Server.start(:app => Jasmine.app(self)) will work
  server.start
end

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
    run QuanApp.new
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

server = Rack::Server.new(:Port => 9292, :AccessLog => [])
server.instance_variable_set(:@app, app) # workaround for Rack bug, when Rack > 1.2.1 is released Rack::Server.start(:app => Jasmine.app(self)) will work
server.start
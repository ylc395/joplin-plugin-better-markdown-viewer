import joplin from 'api';
import App from './driver/joplinPlugin';

const app = new App();
joplin.plugins.register({
  onStart: app.init.bind(app),
});

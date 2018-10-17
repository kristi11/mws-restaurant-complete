// modified the gruntfile from the previous one given on the course
module.exports = function(grunt) {

    grunt.initConfig({

        responsive_images: {
            tiny: { //<-- This is the Target for 'tiny' images
                options: {
                  name: false,
                  rename: false,
                    sizes: [{
                        width: 10,
                        quality: 50,
                    }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img/',
                    dest: 'img-tiny/'
                }]
            },
            small: { //<-- This is the Target for 'small' images
                options: {
                  name: false,
                  rename: false,
                    sizes: [{
                        width: 420,
                        quality: 50,
                    }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img/',
                    dest: 'img-small/'
                }]
            },
            medium: { //<-- This is the Target for 'medium' images
                options: {
                  name: false,
                  rename: false,
                    sizes: [{
                        width: 640,
                        quality: 50,
                        suffix: ''
                    }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img/',
                    dest: 'img-medium/'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-responsive-images')
    grunt.registerTask('default', ['responsive_images']);
    grunt.registerTask('responsiveImages', [
      'responsive_images:small',
      'responsive_images:medium'
    ]);

};
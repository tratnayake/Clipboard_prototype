<?php get_header(); ?>

 <div id="introDiv" class="container-fluid">
      <div class="container">
        <div class="box" id="Welcome"> 
          <img style="margin:auto;" class="img-responsive" src="<?php echo get_template_directory_uri(); ?>/library/images/ShetoShic_dropshadow2.png">
          <h3>Where Beauty Meets Convenience...Naturally</h3>

        </div>
      </div>
    </div>
    <div id="level1Container" class="container-fluid">
      <div id="level1" class="container level">

        <?php if( get_field('alert_green') ): ?>
          <div class="alert alert-success" role="alert"><?php the_field('alert_green') ?></div>
        <?php endif ; ?>

        <?php if( get_field('alert_blue') ): ?>
          <div class="alert alert-info" role="alert"><?php the_field('alert_blue') ?></div>
        <?php endif ; ?>

        <?php if( get_field('alert_yellow') ): ?>
          <div class="alert alert-warning" role="alert"><?php the_field('alert_yellow') ?></div>
        <?php endif ; ?>

        <?php if( get_field('alert_red') ): ?>
          <div class="alert alert-danger" role="alert"><?php the_field('alert_red') ?></div>
        <?php endif ; ?>



<?php if (have_posts()) : while (have_posts()) : the_post(); ?>

                <section class="entry-content cf" itemprop="articleBody">
                  <?php
                    // the content (pretty self explanatory huh)
                    the_content();

                    wp_link_pages( array(
                      'before'      => '<div class="page-links"><span class="page-links-title">' . __( 'Pages:', 'bonestheme' ) . '</span>',
                      'after'       => '</div>',
                      'link_before' => '<span>',
                      'link_after'  => '</span>',
                    ) );
                  ?>
                </section> <?php // end article section ?>

              
              <?php endwhile; else : ?>

                  <article id="post-not-found" class="hentry cf">
                    <header class="article-header">
                      <h1><?php _e( 'Oops, Post Not Found!', 'bonestheme' ); ?></h1>
                    </header>
                    <section class="entry-content">
                      <p><?php _e( 'Uh Oh. Something is missing. Try double checking things.', 'bonestheme' ); ?></p>
                    </section>
                    <footer class="article-footer">
                        <p><?php _e( 'This is the error message in the page.php template.', 'bonestheme' ); ?></p>
                    </footer>
                  </article>

              <?php endif; ?>
<br>
             <ul class="socmed">
              <?php
  
 get_sub_field('social_media_url'); 
        // check if the repeater field has rows of data
        if( have_rows('socmed') ):

          // loop through the rows of data
          $counter = 0;
            while ( have_rows('socmed') ) : the_row(); ?>

             <li><a href="<?php the_sub_field('social_media_url'); ?>"><img height="100" width = "100" src="<?php the_sub_field('social_media_icon'); ?>"></a></li>


           <?php 
           $counter++;
           endwhile; 

        else :

            // no rows found

        endif;

?>    

        </ul>
      </div>
    </div>          
<div id="level2Container" class="container-fluid">
      <div id="level2" class="container level">
        <h1>What's new at She To  Shic</h1>
        <br>
          <div class="row">
            <div class="col-xs-12 col-md-4">
              <?php the_field('whatsnew'); ?>
            </div>
        
      </div>  

    </div>
  </div>
    <div id="level3Container" class="container-fluid">
      <div id="level3" class="container level">
        <h1>Our Services</h1>
        <br>
           
               <?php

                           $my_wp_query = new WP_Query();
                      $all_wp_pages = $my_wp_query->query(array('post_type' => 'page','posts_per_page'=>-1));
                      $child_IDs =array();

                      // Get the page as an Object
                      $Services =  get_page_by_title('Services');

                      // Filter through all pages and find Services's children
                      $services_children = get_page_children( $Services->ID, $all_wp_pages);

                      foreach ($services_children as $child) {
                            
                         $postLink = get_permalink($child->ID);
                         $postImage  = get_field('serviceicon',$child->ID);
                         $postTitle = $child->post_title;
                          


                        echo "<div class='col-xs-12 col-md-3 service'><a style='color: purple' href='".$postLink."'><img class='serviceIcons' src='".$postImage."'/><h4>".$postTitle."</h4></a></div>";
                      }
                      
                      // echo what we get back from WP to the browser
                      //echo '<pre>' . print_r( $services_children, true ) . '</pre>';
                      

                       
                        ?>
           
            <br>
      </div>
    </div>

    <div id="level4Container" class="container-fluid">
      <div id="level4" class="container level">
          <h1>Come experience it yourself</h1>
          <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-6">
             <?php echo do_shortcode('[contact-form-7 id="64" title="Contact form 1"]'); ?>  
     </div>
           <div class="col-xs-12 col-sm-12 col-md-6">
      
  <?php $page = get_page_by_title( 'Home' );
            $HomeID = $page->ID; ?>

               <iframe
              width="100%"
              height="450"
              frameborder="0" style="border:0"
              src="<?php the_field('map',$HomeID) ?>">
              </iframe>


    
              </div>

          </div>
      </div>
         
    </div>

  

    <?php
  $args = array( 'numberposts' => '1' );
  $recent_posts = wp_get_recent_posts( $args );
  $postTitle;
  $postLink;
  $postExcerpt;
  foreach( $recent_posts as $recent ){

    //print_r($recent);
    $postTitle = $recent["post_title"];
    $postLink = get_permalink($recent["ID"]);
    $postExcerpt = $recent["post_content"];
    $postImage  = wp_get_attachment_url( get_post_thumbnail_id($recent["ID"]) );


  }
?>

 

    


<?php get_footer(); ?>
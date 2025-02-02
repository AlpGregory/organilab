

function add_rol_org(url, data){

     data = {
        'name': $(data[0]).val(),
        'rol': $(data[1]).val()
    }

    if($("input[name='relate_rols']")[0].checked){
        data['relate_rols'] = $("#addrolmodal select").val();
    }

    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(data),
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: function( data ) {
           window.location.reload();
      },
      error: function( jqXHR, textStatus, errorThrown ){
        Swal.fire({
          icon: 'error',
          title: 'Name',
          text: jqXHR.responseJSON.name[0],
        })
      },
      dataType: 'json'
    });
}


function copy_rol_org(url){
     $("#addrolmodal form").attr('action', url);
     $("#addrolmodal form").submit();
}


$("#saveroluserorg").on('click', function(){
    var btnsave = $("#addrolmodal button.active");
    var url = btnsave.data('url');

    if(btnsave.data('copy')){
        copy_rol_org(url);
    }else{
        add_rol_org(url, $("#addrolmodal div#add_rol_container").find('input'));
    }
});


document.contextroletable={
    as_conttentype: false,
    as_user: false,
    as_role: true,
    profile: null,
    contenttypeobj: null,
    user: null
}



$(".applyasrole").on('click', function(e){
    document.contextroletable.as_conttentype=false;
    document.contextroletable.as_user=false;
    document.contextroletable.user=null;
    document.contextroletable.as_role=true;
    document.contextroletable.contenttypeobj=Object.assign({}, e.target.dataset);
    document.contextroletable.profile= e.target.dataset.profile
    $("#modal"+e.target.dataset.org).modal('show');
});
$(".applybycontenttype").on('click', function(e){
    document.contextroletable.as_conttentype=true;
    document.contextroletable.as_user=false;
    document.contextroletable.user=null;
    document.contextroletable.as_role=false;
    document.contextroletable.profile=null;
    document.contextroletable.contenttypeobj=Object.assign({}, e.target.dataset);
    $("#modal"+e.target.dataset.org).modal('show');
});
$(".applybyuser").on('click', function(e){
    document.contextroletable.as_role=false;
    document.contextroletable.as_conttentype=false;
    document.contextroletable.contenttypeobj=null;
    document.contextroletable.as_user=true;
    document.contextroletable.profile=e.target.dataset.user;
    $("#modal"+e.target.dataset.org).modal('show');
});


$(".userbtnadd").on('click', function(e){
    document.contextroletable.as_conttentype=true;
    document.contextroletable.as_user=false;
    document.contextroletable.user=null;
    document.contextroletable.as_role=false;
    document.contextroletable.contenttypeobj=Object.assign({}, e.target.dataset);
    document.contextroletable.profile=null;
    $("#modaluser"+e.target.dataset.id).modal('show');
});

document.profileroleselects={

}


function add_selected_elements_to_select2(rols, data){
    return ()=>{
        for(let x=0; x<data.length; x++){
         if ($(rols).find("option[value='" + data[x].id + "']").length) {
            $(rols).val(data[x].id).trigger('change');
         }else{
            var newOption = new Option(data[x].text, data[x].id, true, true);
            $(rols).append(newOption).trigger('change');
         }
        }
    };

}

function add_data_to_select(rols){

    $(rols).find('option').remove();
    $(rols).val(null).trigger('change');

    return (data)=>{
        let has_selected=false;
        for(let x=0; x<data.results.length; x++){
            if(data.results[x].selected){
                has_selected=true;
            }
            if ($(rols).find("option[value='" + data.results[x].id + "']").length) {
                $(rols).val(data.results[x].id).trigger('change');
            }else{
                var newOption = new Option(data.results[x].text, data.results[x].id, data.results[x].selected,
                        data.results[x].selected);
                $(rols).append(newOption)

            }
        }
        if(!has_selected) {
            $(rols).val(null).trigger('change');
        }else{
            $(rols).trigger('change');
        }
    }
}

$(".addprofilerol").on('show.bs.modal', function (e) {


    let modalid=e.target.id;
    var selecttarget = $("#"+modalid+' select');
    var rols = selecttarget;
    var organization = this.dataset.id;
    var url = $(rols).data('url');
    var selecteditems = [];

    if(Object.hasOwnProperty(document.profileroleselects, modalid) ){
        $(rols).select2('destroy');

    }

    $.ajax({
      type: "GET",
      url: url,
      data: document.contextroletable,
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: add_data_to_select(rols),
      dataType: 'json'
    });
    $(rols).select2({theme: 'bootstrap-5',  dropdownParent: $(this)});

});


$(".relatedusermodal").on('show.bs.modal', function (e) {


    let modalid=e.target.id;
    var selecttarget = $("#"+modalid+' select');
    var users = selecttarget;
    var organization = this.dataset.id;
    var url = $(users).data('url');

    $.ajax({
      type: "GET",
      url: url,
      data: document.contextroletable,
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: add_data_to_select(users),
      dataType: 'json'
    });
    $(users).select2({theme: 'bootstrap-5',  dropdownParent: $(this)});
});


$(".btnsaverole").on('click', function(e){
    let form = $(e.target).closest('form')[0]
    let url = form.action;
    let dataform = {
        'rols': $(form).find('select[name="rols"]').val(),
        'mergeaction': $(form).find('input[name="mergeaction"]:checked').val(),
        'csrfmiddlewaretoken': $(form).find('input[name="csrfmiddlewaretoken"]').val(),
    }
    let data=Object.assign(dataform, document.contextroletable);


    $.ajax({
      type: "PUT",
      url: url,
      data: JSON.stringify(data),
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: function( data ) {
           window.location.reload();
      },
      dataType: 'json'
    });
});

$(".addOrgStructure").on('click', function(e){
    let parent=this.dataset.parent;
    $('#id_parent').val(parent);
    $("#addOrganizationmodal").modal('show');
});

$(".addOrgStructureEmpty").on('click', function(e){
    $('#id_parent').val('');
    $("#addOrganizationmodal").modal('show');
});

$(".contenttyperelobjbtnadd").on('click', function(e){
    var url = this.dataset.href;
    var select = $("#relOrganizationmodal select");
    var organizationinput = $('#relOrganizationmodal input[name="organization"]');
    organizationinput.val(this.dataset.org)
    $(select).val(null).trigger('change');
/**
    $.ajax({
      type: "GET",
      url: url,
      data: document.contextroletable,
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: add_data_to_select(select),
      dataType: 'json'
    });
    $(select).select2({theme: 'bootstrap-5',  dropdownParent: $("#relOrganizationmodal")});
    **/
    $("#relOrganizationmodal").modal('show');
});

$(".rolbtnadd").on('click', function(){
    var orgpk = $(this).data('id');
    $("#addrolmodal div#add_rol_container input[name='orgpk']").val(orgpk);
    $("#btn_copy_rol").attr('data-url', $(this).data('url'));
    $("#addrolmodal").modal('show');
    $("#addrolmodal select").val(null).trigger('change');
});

$("#addrolmodal").on('hidden.bs.modal', function () {
    $("#btn_copy_rol").removeAttr('data-url');
    $("#addrolmodal div#add_rol_container input#rolname").val('');
    $("#addrolmodal div#add_rol_container input[name='orgpk']").val('');
    $("#addrolmodal input[name='relate_rols']").prop('checked', true).trigger("click");
    $("#addrolmodal select").val(null).trigger('change');
})

function setactiveTabButton(element){
    let btnteam = $(element).closest('.btn-toggle').find(".btn");
    btnteam.removeClass('btn-primary')
    btnteam.removeClass("active");
    btnteam.addClass('btn-default');
    element.addClass('btn-primary')
    element.addClass("active");
}

$("#btn_add_rol").on('click', function(e){
    if(!$(this).hasClass('active')){
        $("#addrolmodal select").val(null).trigger('change');
        $("#add_rol_container").show();
        $("#copy_rol_container").hide();
        var rolsS2 = $("#addrolmodal #selectroldiv");
        $("#add_rol_container").append(rolsS2);
        $("#addrolmodal form").attr('action', $(this).data('url'));
        $("#addrolmodal input[name='relate_rols']").parent().show();
        if($("input[name='relate_rols']")[0].checked){
            $("#addrolmodal div#rolS2container").show();
        }else{
            $("#addrolmodal div#rolS2container").hide();
        }
        setactiveTabButton($(this));
    }else{
        e.preventDefault()
    }
});


$("#btn_copy_rol").on('click', function(e){
    if(!$(this).hasClass('active')){
        $("#addrolmodal select").val(null).trigger('change');
        $("#add_rol_container").hide();
        $("#copy_rol_container").show();
        var rolsS2 = $("#addrolmodal #selectroldiv");
        $("#copy_rol_container").append(rolsS2);
        $("#addrolmodal form").attr('action', $(this).data('url'));
        $("#addrolmodal input[name='relate_rols']").parent().hide();
        $("#addrolmodal div#rolS2container").show();
        setactiveTabButton($(this));
    }else{
        e.preventDefault()
    }
});

/**
$('.btn-toggle').click(function() {
    $(this).find('.btn').toggleClass('active');
  if ($(this).find('.btn-primary').length>0) {
      $(this).find('.btn').toggleClass('btn-primary');
    }
  $(this).find('.btn').toggleClass('btn-default');
 });
**/

$(document).ready(function(){
    $("#copy_rol_container").hide();
    $("#addrolmodal div#add_rol_container input#rolname").val('');
    $("#addrolmodal input[name='relate_rols']").prop('checked', true).trigger("click");
 });


$("input[name='relate_rols']").on('change', function(event){
    if($(this)[0].checked){
        $("#addrolmodal div#rolS2container").show();
    }else{
        $("#addrolmodal div#rolS2container").hide();
    }
});


 $("#addrolmodal").on('show.bs.modal', function (e) {
    var selectusers = $("#addrolmodal select");
    var url = $(selectusers).data('url');
    $("#btn_add_rol").click();

    $.ajax({
      type: "GET",
      url: url,
      data: document.contextroletable,
      contentType: 'application/json',
      headers: {'X-CSRFToken': getCookie('csrftoken')},
      success: add_data_to_select(selectusers),
      dataType: 'json'
    });
    $(selectusers).select2({theme: 'bootstrap-5',  dropdownParent: $(this)});
});

 $(".orgbyuser").on('click', function (e) {
    $('#orgbyusermodal input[name="name"]').val(this.dataset.display);
    $('#orgbyusermodal form').attr('action', this.dataset.formaction);

    var selectorgbyusers = $("#orgbyusermodal select");
    let placeholder = selectorgbyusers.attr('placeholder');
    $("#orgbyusermodal option").remove();


    var url = $(selectorgbyusers).data('url');
        $.ajax({
          type: "GET",
          url: url,
          data: {'org': this.dataset.org},
          contentType: 'application/json',
          headers: {'X-CSRFToken': getCookie('csrftoken')},
          success: add_data_to_select(selectorgbyusers),
          dataType: 'json'
        });
    $(selectorgbyusers).select2({theme: 'bootstrap-5', placeholder: placeholder,
    allowClear: true,  dropdownParent: $("#orgbyusermodal")});

    $("#orgbyusermodal").modal('show');
});